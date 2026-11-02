import os
import sqlite3
import unittest
from werkzeug.security import check_password_hash

class TestStage5SchemaAndMigration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'LocalLift_DB.sqlite')
        cls.conn = sqlite3.connect(cls.db_path)
        cls.conn.row_factory = sqlite3.Row
        cls.cur = cls.conn.cursor()

    @classmethod
    def tearDownClass(cls):
        cls.conn.close()

    def test_database_integrity(self):
        self.cur.execute("PRAGMA integrity_check")
        res = self.cur.fetchone()[0]
        self.assertEqual(res, "ok", "Database integrity check failed!")

    def test_tables_exist(self):
        expected_tables = {
            'Users', 'Vendors', 'Products', 'Offers', 'Orders', 'Order_Items',
            'Reviews', 'Cart', 'Cities', 'Zones', 'Delivery_Partners',
            'Order_Groups', 'Delivery_Earnings_Ledger', 'Delivery_Partner_Locations',
            'Coupons', 'User_Rewards', 'In_App_Notifications'
        }
        self.cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        actual_tables = {r[0] for r in self.cur.fetchall()}
        missing = expected_tables - actual_tables
        self.assertEqual(len(missing), 0, f"Missing tables: {missing}")

    def test_cities_and_zones_seeded(self):
        self.cur.execute("SELECT name, slug, state FROM Cities ORDER BY name")
        cities = {r['slug']: dict(r) for r in self.cur.fetchall()}
        self.assertIn('ludhiana', cities)
        self.assertIn('delhi', cities)
        self.assertEqual(cities['ludhiana']['state'], 'Punjab')
        self.assertEqual(cities['delhi']['state'], 'Delhi')

        self.cur.execute("SELECT name, slug FROM Zones")
        zones = [r['slug'] for r in self.cur.fetchall()]
        self.assertIn('model-town', zones)
        self.assertIn('sarabha-nagar', zones)
        self.assertIn('civil-lines', zones)
        self.assertIn('connaught-place', zones)

    def test_coupons_seeded(self):
        self.cur.execute("SELECT code, discount_type, discount_val FROM Coupons")
        coupons = {r['code']: dict(r) for r in self.cur.fetchall()}
        self.assertIn('LIFT50', coupons)
        self.assertIn('FREEDEL', coupons)
        self.assertIn('WELCOME100', coupons)

    def test_demo_delivery_partner_seeded(self):
        self.cur.execute("SELECT user_id, name, email, user_type, password_hash FROM Users WHERE email = 'delivery@locallift.com'")
        user = self.cur.fetchone()
        self.assertIsNotNone(user, "Demo delivery user not found!")
        self.assertEqual(user['user_type'], 'delivery')
        self.assertTrue(check_password_hash(user['password_hash'], 'password123'), "Password hash verification failed!")

        self.cur.execute("SELECT * FROM Delivery_Partners WHERE user_id = ?", (user['user_id'],))
        partner = self.cur.fetchone()
        self.assertIsNotNone(partner, "Delivery partner profile not found!")
        self.assertEqual(partner['vehicle_number'], 'PB10-DL-5521')
        self.assertEqual(partner['status'], 'approved')
        self.assertEqual(partner['is_online'], 1)

    def test_orders_new_columns(self):
        self.cur.execute("PRAGMA table_info(Orders)")
        cols = {r['name'] for r in self.cur.fetchall()}
        expected_cols = {
            'order_id', 'user_id', 'vendor_id', 'total_amount', 'status', 'notes',
            'group_id', 'city_id', 'zone_id', 'delivery_partner_id', 'delivery_status',
            'pickup_otp_hash', 'pickup_otp_expires_at', 'pickup_otp_attempts',
            'delivery_otp_hash', 'delivery_otp_expires_at', 'delivery_otp_attempts',
            'pickup_lat', 'pickup_lng', 'dropoff_lat', 'dropoff_lng',
            'delivery_fee', 'partner_payout', 'assigned_at', 'arrived_store_at',
            'picked_up_at', 'delivered_at', 'cancelled_at'
        }
        missing = expected_cols - cols
        self.assertEqual(len(missing), 0, f"Missing columns in Orders table: {missing}")

    def test_idempotent_migration(self):
        from migrate_v2_pan_india import run_migration
        success = run_migration(self.db_path)
        self.assertTrue(success, "Re-running migration should be safe and idempotent")

if __name__ == '__main__':
    unittest.main()
