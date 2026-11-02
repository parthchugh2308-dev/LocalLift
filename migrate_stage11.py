"""
LocalLift 2.0 - Stage 11 Database Migration Script
Applies Stage 11 Financial & Payment schema enhancements non-destructively:
- Adds Payments table with gateway IDs, amount, currency, status, and method
- Adds Vendor_Settlements table for auditable vendor earnings & platform commission
- Adds Refunds table for full and partial refund tracking
- Adds Financial_Audit_Log table for immutable financial event auditing
- Adds Platform_Settings table for configurable commission rates and fees
- Extends Delivery_Earnings_Ledger with payout settlement tracking (is_settled, settled_at)
- Adds appropriate indexes for fast lookup and relational integrity
"""

import os
import sqlite3

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

def add_column_if_not_exists(conn, table_name, column_name, col_definition):
    cur = conn.cursor()
    try:
        cur.execute(f"PRAGMA table_info({table_name})")
        existing = [row[1] for row in cur.fetchall()]
        if column_name not in existing:
            print(f"Adding column '{column_name}' to '{table_name}'...")
            cur.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {col_definition}")
            conn.commit()
        else:
            print(f"Column '{column_name}' already exists in '{table_name}'. Skipping.")
    except Exception as e:
        print(f"Error checking/adding column {column_name} in {table_name}: {e}")

def run_stage11_migration(db_path=None):
    if not db_path:
        db_path = get_db_path()

    print(f"Starting Stage 11 migration on: {db_path}")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("PRAGMA foreign_keys = ON")

    # 1. Payments Table
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

    # 2. Vendor_Settlements Table
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

    # 3. Refunds Table
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

    # 4. Financial_Audit_Log Table
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

    # 5. Platform_Settings Table & Default Seeds
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

    # 6. Extend Delivery_Earnings_Ledger with settlement tracking
    add_column_if_not_exists(conn, 'Delivery_Earnings_Ledger', 'is_settled', 'INTEGER DEFAULT 0')
    add_column_if_not_exists(conn, 'Delivery_Earnings_Ledger', 'settled_at', 'TIMESTAMP')

    conn.commit()

    # 7. Verification
    cur.execute("PRAGMA integrity_check")
    integrity = cur.fetchone()[0]
    print(f"Stage 11 migration completed. Integrity check: {integrity}")
    conn.close()
    return integrity == 'ok'

if __name__ == '__main__':
    success = run_stage11_migration()
    print("Stage 11 Migration SUCCESS!" if success else "Stage 11 Migration FAILED!")
