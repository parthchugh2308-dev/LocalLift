"""
LocalLift 2.0 - Pan-India Database Migration Script
Applies Stage 5 schema enhancements non-destructively:
- Adds Cities and Zones tables
- Adds Fleet Management: Delivery_Partners and Delivery_Partner_Locations
- Adds Multi-Vendor Order Grouping: Order_Groups
- Adds Exactly-Once Financial Audit: Delivery_Earnings_Ledger
- Adds Commerce Infrastructure: Coupons, User_Rewards, In_App_Notifications
- Extends Orders table with delivery tracking, coordinates, and secure OTP hashes
- Extends Vendors and Users tables with city and zone references
- Seeds initial cities (Ludhiana, New Delhi), zones, coupons, and a demo delivery partner
"""

import os
import sqlite3
from werkzeug.security import generate_password_hash

def get_db_path():
    env_path = os.environ.get('DATABASE_PATH')
    if env_path:
        db_path = env_path
    elif os.environ.get('VERCEL'):
        db_path = '/tmp/LocalLift_DB.sqlite'
    else:
        db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'LocalLift_DB.sqlite')
    parent = os.path.dirname(os.path.abspath(db_path))
    if parent:
        os.makedirs(parent, exist_ok=True)
    return db_path

def get_existing_columns(conn, table_name):
    cur = conn.cursor()
    try:
        cur.execute(f"PRAGMA table_info({table_name})")
        return [row[1] for row in cur.fetchall()]
    except Exception:
        return []

def add_column_if_not_exists(conn, table_name, column_name, col_definition):
    existing = get_existing_columns(conn, table_name)
    if column_name not in existing:
        cur = conn.cursor()
        print(f"Adding column '{column_name}' to '{table_name}'...")
        cur.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {col_definition}")
        conn.commit()
    else:
        print(f"Column '{column_name}' already exists in '{table_name}'. Skipping.")

def run_migration(db_path=None):
    if not db_path:
        db_path = get_db_path()
    
    print(f"Starting LocalLift 2.0 migration on: {db_path}")
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON")
    cur = conn.cursor()

    # 1. Cities
    cur.execute('''
        CREATE TABLE IF NOT EXISTS Cities (
            city_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            state TEXT NOT NULL,
            center_lat REAL NOT NULL,
            center_lng REAL NOT NULL,
            radius_km REAL DEFAULT 25.0,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 2. Zones
    cur.execute('''
        CREATE TABLE IF NOT EXISTS Zones (
            zone_id INTEGER PRIMARY KEY AUTOINCREMENT,
            city_id INTEGER NOT NULL REFERENCES Cities(city_id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            polygon_geojson TEXT,
            base_delivery_fee REAL DEFAULT 30.0,
            per_km_fee REAL DEFAULT 8.0,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 3. Order_Groups (Multi-Vendor Checkout Parent)
    cur.execute('''
        CREATE TABLE IF NOT EXISTS Order_Groups (
            group_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
            total_product_amount REAL NOT NULL,
            total_delivery_fee REAL DEFAULT 0.0,
            coupon_discount REAL DEFAULT 0.0,
            coupon_code TEXT,
            points_discount REAL DEFAULT 0.0,
            points_redeemed INTEGER DEFAULT 0,
            net_payable_amount REAL NOT NULL,
            payment_method TEXT DEFAULT 'cod',
            payment_status TEXT DEFAULT 'pending',
            delivery_address TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            dropoff_lat REAL,
            dropoff_lng REAL,
            notes TEXT,
            idempotency_key TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 4. Delivery_Partners
    cur.execute('''
        CREATE TABLE IF NOT EXISTS Delivery_Partners (
            partner_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
            full_name TEXT NOT NULL,
            phone TEXT NOT NULL UNIQUE,
            city_id INTEGER REFERENCES Cities(city_id),
            zone_id INTEGER REFERENCES Zones(zone_id),
            vehicle_type TEXT DEFAULT 'Motorcycle',
            vehicle_number TEXT NOT NULL,
            driving_license_number TEXT,
            status TEXT DEFAULT 'pending',
            is_online INTEGER DEFAULT 0,
            current_lat REAL,
            current_lng REAL,
            last_location_time TIMESTAMP,
            current_order_id INTEGER REFERENCES Orders(order_id),
            rating REAL DEFAULT 5.0,
            total_trips INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 5. Delivery_Earnings_Ledger (Exactly-Once Financial Ledger)
    cur.execute('''
        CREATE TABLE IF NOT EXISTS Delivery_Earnings_Ledger (
            ledger_id INTEGER PRIMARY KEY AUTOINCREMENT,
            partner_id INTEGER NOT NULL REFERENCES Delivery_Partners(partner_id) ON DELETE CASCADE,
            order_id INTEGER NOT NULL REFERENCES Orders(order_id) ON DELETE CASCADE,
            event_type TEXT NOT NULL,
            base_payout REAL NOT NULL,
            distance_bonus REAL DEFAULT 0.0,
            surge_bonus REAL DEFAULT 0.0,
            total_amount REAL NOT NULL,
            idempotency_key TEXT UNIQUE NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(order_id, partner_id, event_type)
        )
    ''')

    # 6. Delivery_Partner_Locations (Telemetry History for Active Trips)
    cur.execute('''
        CREATE TABLE IF NOT EXISTS Delivery_Partner_Locations (
            location_id INTEGER PRIMARY KEY AUTOINCREMENT,
            partner_id INTEGER NOT NULL REFERENCES Delivery_Partners(partner_id) ON DELETE CASCADE,
            order_id INTEGER REFERENCES Orders(order_id) ON DELETE SET NULL,
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            heading REAL,
            speed REAL,
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 7. Coupons
    cur.execute('''
        CREATE TABLE IF NOT EXISTS Coupons (
            coupon_id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            discount_type TEXT NOT NULL,
            discount_val REAL NOT NULL,
            min_order_val REAL DEFAULT 0.0,
            max_discount REAL,
            city_id INTEGER REFERENCES Cities(city_id),
            valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            valid_to TIMESTAMP,
            usage_limit INTEGER DEFAULT 1000,
            times_used INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1
        )
    ''')

    # 8. User_Rewards
    cur.execute('''
        CREATE TABLE IF NOT EXISTS User_Rewards (
            reward_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
            points_balance INTEGER DEFAULT 0,
            tier TEXT DEFAULT 'Bronze',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 9. In_App_Notifications
    cur.execute('''
        CREATE TABLE IF NOT EXISTS In_App_Notifications (
            notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            order_id INTEGER REFERENCES Orders(order_id),
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()

    # 10. Alter Orders table for delivery fields, OTPs, and geographic linkage
    order_columns = [
        ('group_id', 'INTEGER REFERENCES Order_Groups(group_id) ON DELETE SET NULL'),
        ('city_id', 'INTEGER REFERENCES Cities(city_id)'),
        ('zone_id', 'INTEGER REFERENCES Zones(zone_id)'),
        ('delivery_partner_id', 'INTEGER REFERENCES Delivery_Partners(partner_id)'),
        ('delivery_status', "TEXT DEFAULT 'unassigned'"),
        ('pickup_otp_hash', 'TEXT'),
        ('pickup_otp_expires_at', 'TIMESTAMP'),
        ('pickup_otp_attempts', 'INTEGER DEFAULT 0'),
        ('delivery_otp_hash', 'TEXT'),
        ('delivery_otp_expires_at', 'TIMESTAMP'),
        ('delivery_otp_attempts', 'INTEGER DEFAULT 0'),
        ('pickup_lat', 'REAL'),
        ('pickup_lng', 'REAL'),
        ('dropoff_lat', 'REAL'),
        ('dropoff_lng', 'REAL'),
        ('delivery_fee', 'REAL DEFAULT 30.0'),
        ('partner_payout', 'REAL DEFAULT 25.0'),
        ('assigned_at', 'TIMESTAMP'),
        ('arrived_store_at', 'TIMESTAMP'),
        ('picked_up_at', 'TIMESTAMP'),
        ('delivered_at', 'TIMESTAMP'),
        ('cancelled_at', 'TIMESTAMP'),
    ]
    for col, col_def in order_columns:
        add_column_if_not_exists(conn, 'Orders', col, col_def)

    # 10a. Stage 10: Ensure idempotency_key on Order_Groups + unique index
    add_column_if_not_exists(conn, 'Order_Groups', 'idempotency_key', 'TEXT')
    existing_indexes = [row[1] for row in conn.execute("PRAGMA index_list(Order_Groups)").fetchall()]
    if 'idx_order_groups_idempotency' not in existing_indexes:
        try:
            conn.execute("CREATE UNIQUE INDEX idx_order_groups_idempotency ON Order_Groups(idempotency_key) WHERE idempotency_key IS NOT NULL")
        except Exception:
            pass

    # 11. Alter Vendors table for city and zone linkage
    vendor_columns = [
        ('city_id', 'INTEGER REFERENCES Cities(city_id)'),
        ('zone_id', 'INTEGER REFERENCES Zones(zone_id)'),
    ]
    for col, col_def in vendor_columns:
        add_column_if_not_exists(conn, 'Vendors', col, col_def)

    # 12. Alter Users table for city and zone linkage
    user_columns = [
        ('city_id', 'INTEGER REFERENCES Cities(city_id)'),
        ('zone_id', 'INTEGER REFERENCES Zones(zone_id)'),
    ]
    for col, col_def in user_columns:
        add_column_if_not_exists(conn, 'Users', col, col_def)

    # 13. Seed Initial Cities (Ludhiana & New Delhi)
    cities_data = [
        ('Ludhiana', 'ludhiana', 'Punjab', 30.9010, 75.8573, 30.0, 1),
        ('New Delhi', 'delhi', 'Delhi', 28.6139, 77.2090, 40.0, 1)
    ]
    for name, slug, state, lat, lng, radius, active in cities_data:
        cur.execute("SELECT city_id FROM Cities WHERE slug = ?", (slug,))
        if not cur.fetchone():
            cur.execute("""
                INSERT INTO Cities (name, slug, state, center_lat, center_lng, radius_km, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (name, slug, state, lat, lng, radius, active))
            print(f"Seeded city: {name}")

    conn.commit()

    # Get city IDs
    cur.execute("SELECT city_id FROM Cities WHERE slug = 'ludhiana'")
    ludhiana_id = cur.fetchone()[0]
    cur.execute("SELECT city_id FROM Cities WHERE slug = 'delhi'")
    delhi_id = cur.fetchone()[0]

    # 14. Seed Initial Zones
    zones_data = [
        (ludhiana_id, 'Model Town', 'model-town', 25.0, 7.0, 1),
        (ludhiana_id, 'Sarabha Nagar', 'sarabha-nagar', 25.0, 7.0, 1),
        (ludhiana_id, 'Civil Lines', 'civil-lines', 30.0, 8.0, 1),
        (delhi_id, 'Connaught Place', 'connaught-place', 35.0, 9.0, 1),
        (delhi_id, 'South Extension', 'south-ext', 35.0, 9.0, 1)
    ]
    for cid, name, slug, base_fee, per_km, active in zones_data:
        cur.execute("SELECT zone_id FROM Zones WHERE city_id = ? AND slug = ?", (cid, slug))
        if not cur.fetchone():
            cur.execute("""
                INSERT INTO Zones (city_id, name, slug, base_delivery_fee, per_km_fee, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (cid, name, slug, base_fee, per_km, active))
            print(f"Seeded zone: {name}")

    conn.commit()

    # 15. Seed Initial Coupons
    coupons_data = [
        ('LIFT50', 'percent', 50.0, 199.0, 100.0, 1000, 1),
        ('FREEDEL', 'flat', 30.0, 249.0, 30.0, 1000, 1),
        ('WELCOME100', 'flat', 100.0, 499.0, 100.0, 1000, 1)
    ]
    for code, dtype, dval, min_val, max_d, limit, active in coupons_data:
        cur.execute("SELECT coupon_id FROM Coupons WHERE code = ?", (code,))
        if not cur.fetchone():
            cur.execute("""
                INSERT INTO Coupons (code, discount_type, discount_val, min_order_val, max_discount, usage_limit, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (code, dtype, dval, min_val, max_d, limit, active))
            print(f"Seeded coupon: {code}")

    conn.commit()

    # 16. Seed Demo Delivery Partner User & Profile
    cur.execute("SELECT user_id FROM Users WHERE email = 'delivery@locallift.com'")
    delivery_user = cur.fetchone()
    if not delivery_user:
        hashed = generate_password_hash('password123')
        cur.execute("""
            INSERT INTO Users (name, email, phone, password_hash, location, user_type, city_id)
            VALUES (?, ?, ?, ?, ?, 'delivery', ?)
        """, ('Rajesh Kumar', 'delivery@locallift.com', '+919876543210', hashed, 'Ludhiana, Punjab', ludhiana_id))
        delivery_user_id = cur.lastrowid
        print("Seeded demo delivery user: delivery@locallift.com")
    else:
        delivery_user_id = delivery_user[0]

    cur.execute("SELECT partner_id FROM Delivery_Partners WHERE user_id = ?", (delivery_user_id,))
    if not cur.fetchone():
        # Get Model Town zone_id
        cur.execute("SELECT zone_id FROM Zones WHERE slug = 'model-town' AND city_id = ?", (ludhiana_id,))
        model_town = cur.fetchone()
        zone_id = model_town[0] if model_town else None

        cur.execute("""
            INSERT INTO Delivery_Partners (
                user_id, full_name, phone, city_id, zone_id, vehicle_type,
                vehicle_number, driving_license_number, status, is_online,
                current_lat, current_lng, rating, total_trips
            ) VALUES (?, ?, ?, ?, ?, 'Motorcycle', 'PB10-DL-5521', 'DL-PB10-2022-00452', 'approved', 1, 30.8985, 75.8340, 4.9, 48)
        """, (delivery_user_id, 'Rajesh Kumar', '+919876543210', ludhiana_id, zone_id))
        print("Seeded demo Delivery Partner profile for Rajesh Kumar (PB10-DL-5521)")

    # 17. Link existing vendors to city_id = 1 (Ludhiana) if unassigned
    cur.execute("UPDATE Vendors SET city_id = ? WHERE city_id IS NULL", (ludhiana_id,))
    
    # 18. Stage 11: Payments, Settlements, Refunds, Audit Log, and Platform Settings
    cur.execute('''
        CREATE TABLE IF NOT EXISTS Payments (
            payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL REFERENCES Order_Groups(group_id) ON DELETE CASCADE,
            customer_id INTEGER NOT NULL REFERENCES Users(user_id),
            gateway TEXT NOT NULL DEFAULT 'razorpay',
            gateway_order_id TEXT,
            gateway_payment_id TEXT UNIQUE,
            amount REAL NOT NULL,
            currency TEXT NOT NULL DEFAULT 'INR',
            payment_status TEXT NOT NULL DEFAULT 'created',
            payment_method TEXT DEFAULT 'online',
            error_code TEXT,
            error_description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cur.execute("CREATE INDEX IF NOT EXISTS idx_payments_group_id ON Payments(group_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_payments_gateway_order_id ON Payments(gateway_order_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_payments_gateway_payment_id ON Payments(gateway_payment_id)")

    cur.execute('''
        CREATE TABLE IF NOT EXISTS Vendor_Settlements (
            settlement_id INTEGER PRIMARY KEY AUTOINCREMENT,
            vendor_id INTEGER NOT NULL REFERENCES Vendors(vendor_id) ON DELETE CASCADE,
            group_id INTEGER NOT NULL REFERENCES Order_Groups(group_id) ON DELETE CASCADE,
            child_order_id INTEGER NOT NULL REFERENCES Orders(order_id) ON DELETE CASCADE,
            gross_amount REAL NOT NULL,
            platform_commission REAL NOT NULL,
            deductions REAL DEFAULT 0.0,
            net_payable REAL NOT NULL,
            settlement_status TEXT NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            settled_at TIMESTAMP
        )
    ''')
    cur.execute("CREATE INDEX IF NOT EXISTS idx_settlements_vendor_id ON Vendor_Settlements(vendor_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_settlements_child_order_id ON Vendor_Settlements(child_order_id)")

    cur.execute('''
        CREATE TABLE IF NOT EXISTS Refunds (
            refund_id INTEGER PRIMARY KEY AUTOINCREMENT,
            payment_id INTEGER REFERENCES Payments(payment_id) ON DELETE SET NULL,
            group_id INTEGER NOT NULL REFERENCES Order_Groups(group_id) ON DELETE CASCADE,
            child_order_id INTEGER REFERENCES Orders(order_id) ON DELETE SET NULL,
            amount REAL NOT NULL,
            reason TEXT,
            gateway_refund_id TEXT UNIQUE,
            refund_status TEXT NOT NULL DEFAULT 'pending',
            created_by INTEGER REFERENCES Users(user_id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cur.execute("CREATE INDEX IF NOT EXISTS idx_refunds_group_id ON Refunds(group_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON Refunds(payment_id)")

    cur.execute('''
        CREATE TABLE IF NOT EXISTS Financial_Audit_Log (
            log_id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT NOT NULL,
            entity_id INTEGER,
            action TEXT NOT NULL,
            actor_type TEXT NOT NULL,
            actor_id INTEGER,
            old_state TEXT,
            new_state TEXT,
            amount REAL,
            details TEXT,
            ip_address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cur.execute("CREATE INDEX IF NOT EXISTS idx_audit_entity ON Financial_Audit_Log(entity_type, entity_id)")

    cur.execute('''
        CREATE TABLE IF NOT EXISTS Platform_Settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            description TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    default_settings = [
        ('vendor_commission_pct', '10.0', 'Standard platform commission percentage on product sales'),
        ('delivery_fee_per_vendor', '30.0', 'Flat delivery fee charged per participating vendor store'),
        ('partner_base_payout', '35.0', 'Base delivery partner payout per completed fulfillment'),
        ('currency', 'INR', 'Standard operational currency symbol and code')
    ]
    for k, v, desc in default_settings:
        cur.execute("INSERT OR IGNORE INTO Platform_Settings (key, value, description) VALUES (?, ?, ?)", (k, v, desc))

    add_column_if_not_exists(conn, 'Delivery_Earnings_Ledger', 'is_settled', 'INTEGER DEFAULT 0')
    add_column_if_not_exists(conn, 'Delivery_Earnings_Ledger', 'settled_at', 'TIMESTAMP')

    conn.commit()

    # 19. Integrity check
    cur.execute("PRAGMA integrity_check")
    integrity = cur.fetchone()[0]
    print(f"Migration completed. SQLite integrity check: {integrity}")
    conn.close()
    return integrity == 'ok'

if __name__ == '__main__':
    success = run_migration()
    print("Migration SUCCESS!" if success else "Migration FAILED!")
