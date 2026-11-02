import os
import sqlite3
import unittest
import json
import time

TEST_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'LocalLift_TEST_stage10.sqlite')
os.environ['DATABASE_PATH'] = TEST_DB_PATH

from init_db import init_db
from app import app, generate_delivery_token, generate_admin_token

class TestStage10MultiVendorCheckout(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if os.path.exists(TEST_DB_PATH):
            try:
                os.remove(TEST_DB_PATH)
            except Exception:
                pass
        init_db(force=True)
        app.config['TESTING'] = True
        cls.client = app.test_client()

        # Seed an additional approved delivery partner and vendor in New Delhi for cross-city testing
        conn = sqlite3.connect(TEST_DB_PATH)
        cur = conn.cursor()
        # Seed Vendor in New Delhi (city_id = 2, zone_id = 4)
        cur.execute("""
            INSERT OR IGNORE INTO Vendors (
                vendor_id, owner_user_id, business_name, owner_name, category, address,
                city, latitude, longitude, phone, email, is_open, status, city_id, zone_id
            ) VALUES (90, 1, 'Delhi Spice Bazaar', 'Anil Mehta', 'Grocery', 'Connaught Place',
                      'New Delhi', 28.6304, 77.2177, '+91 9911223344', 'delhi.bazaar@locallift.com',
                      1, 'approved', 2, 4)
        """)
        # Seed product for Delhi vendor
        cur.execute("""
            INSERT OR IGNORE INTO Products (
                product_id, vendor_id, product_name, category, price, availability, description
            ) VALUES (901, 90, 'Delhi Special Garam Masala (250g)', 'Grocery', 120.0, 1, 'Fresh ground Delhi spices')
        """)
        # Seed Delivery Partner 2 in Ludhiana
        cur.execute("""
            INSERT OR IGNORE INTO Users (user_id, name, email, phone, password_hash, user_type, city_id, zone_id)
            VALUES (88, 'Vikram Delivery', 'vikram.delivery@locallift.com', '+91 9811223344', 'scrypt:test', 'delivery', 1, 1)
        """)
        cur.execute("""
            INSERT OR IGNORE INTO Delivery_Partners (
                partner_id, user_id, full_name, phone, city_id, zone_id,
                vehicle_type, vehicle_number, status, is_online
            ) VALUES (2, 88, 'Vikram Singh', '+91 9811223344', 1, 1, 'Motorcycle', 'PB10-EZ-9988', 'approved', 1)
        """)
        conn.commit()
        conn.close()

    @classmethod
    def tearDownClass(cls):
        if os.path.exists(TEST_DB_PATH):
            try:
                import gc
                gc.collect()
                time.sleep(0.1)
                os.remove(TEST_DB_PATH)
                print(f"[CLEANUP] Successfully cleaned up {TEST_DB_PATH}")
            except Exception as e:
                print(f"[CLEANUP NOTICE] Could not remove test database: {e}")

    def test_01_single_vendor_checkout(self):
        # Customer 1 session
        cust = app.test_client()
        with cust.session_transaction() as sess:
            sess['user_id'] = 1

        payload = {
            'user_id': 1,
            'delivery_address': 'Model Town, Ludhiana',
            'customer_phone': '+91 9876543210',
            'dropoff_lat': 30.9020,
            'dropoff_lng': 75.8580,
            'notes': 'Single Vendor Test',
            'items': [
                {'product_id': 1, 'quantity': 1}  # Chocolate Cake from Vendor 1 (price: 550)
            ]
        }
        res = cust.post('/api/checkout', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertIn('group_id', data)
        self.assertEqual(len(data['child_orders']), 1)
        self.assertEqual(data['summary']['num_vendors'], 1)
        self.assertEqual(data['summary']['total_product_amount'], 550.0)
        self.assertEqual(data['summary']['total_delivery_fee'], 30.0)
        self.assertEqual(data['summary']['net_payable'], 580.0)
        print("  -> Passed! Single-vendor checkout succeeds with 1 parent group & 1 child order.")

    def test_02_multivendor_cart_grouping(self):
        cust = app.test_client()
        with cust.session_transaction() as sess:
            sess['user_id'] = 1

        # Product 1 is from Vendor 1 (price: 550)
        # Product 8 is from Vendor 2 (price: 340) - both vendors in Ludhiana (city_id = 1)
        payload = {
            'user_id': 1,
            'delivery_address': 'Civil Lines, Ludhiana',
            'customer_phone': '+91 9876543210',
            'dropoff_lat': 30.9050,
            'dropoff_lng': 75.8600,
            'items': [
                {'product_id': 1, 'quantity': 2},  # 2 * 550 = 1100 (Vendor 1)
                {'product_id': 8, 'quantity': 1}   # 1 * 340 = 340  (Vendor 2)
            ]
        }
        res = cust.post('/api/checkout', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['summary']['num_vendors'], 2)
        self.assertEqual(len(data['child_orders']), 2)
        self.assertEqual(data['summary']['total_product_amount'], 1440.0)
        self.assertEqual(data['summary']['total_delivery_fee'], 60.0)  # 2 vendors * Rs. 30
        self.assertEqual(data['summary']['net_payable'], 1500.0)
        print(f"  -> Passed! Multi-vendor checkout groups 2 vendors correctly (Total: Rs.{data['summary']['net_payable']}).")

    def test_03_parent_order_creation(self):
        # Query latest Order_Groups record from DB
        conn = sqlite3.connect(TEST_DB_PATH)
        conn.row_factory = sqlite3.Row
        group = conn.execute("SELECT * FROM Order_Groups ORDER BY group_id DESC LIMIT 1").fetchone()
        self.assertIsNotNone(group)
        self.assertEqual(group['user_id'], 1)
        self.assertEqual(group['total_product_amount'], 1440.0)
        self.assertEqual(group['total_delivery_fee'], 60.0)
        self.assertEqual(group['net_payable_amount'], 1500.0)
        self.assertEqual(group['payment_method'], 'cod')
        self.assertEqual(group['payment_status'], 'pending')
        self.assertEqual(group['delivery_address'], 'Civil Lines, Ludhiana')
        conn.close()
        print("  -> Passed! Parent Order_Groups record verified with exact financial totals.")

    def test_04_child_orders_vendor_association(self):
        conn = sqlite3.connect(TEST_DB_PATH)
        conn.row_factory = sqlite3.Row
        latest_group = conn.execute("SELECT group_id FROM Order_Groups ORDER BY group_id DESC LIMIT 1").fetchone()['group_id']

        child_orders = conn.execute("SELECT * FROM Orders WHERE group_id = ? ORDER BY order_id ASC", (latest_group,)).fetchall()
        self.assertEqual(len(child_orders), 2, "Must create exactly 2 child orders for 2 vendors")

        # Child 1: Vendor 1
        c1 = child_orders[0]
        self.assertEqual(c1['vendor_id'], 1)
        self.assertEqual(c1['total_amount'], 1100.0)
        self.assertEqual(c1['delivery_fee'], 30.0)
        self.assertEqual(c1['delivery_status'], 'unassigned')

        # Child 2: Vendor 2
        c2 = child_orders[1]
        self.assertEqual(c2['vendor_id'], 2)
        self.assertEqual(c2['total_amount'], 340.0)
        self.assertEqual(c2['delivery_fee'], 30.0)
        self.assertEqual(c2['delivery_status'], 'unassigned')

        # Verify Order_Items linkage
        items_c1 = conn.execute("SELECT * FROM Order_Items WHERE order_id = ?", (c1['order_id'],)).fetchall()
        self.assertEqual(len(items_c1), 1)
        self.assertEqual(items_c1[0]['product_id'], 1)
        self.assertEqual(items_c1[0]['quantity'], 2)

        items_c2 = conn.execute("SELECT * FROM Order_Items WHERE order_id = ?", (c2['order_id'],)).fetchall()
        self.assertEqual(len(items_c2), 1)
        self.assertEqual(items_c2[0]['product_id'], 8)
        conn.close()
        print("  -> Passed! Child orders and order items mapped to correct vendors under group_id.")

    def test_05_incorrect_product_prices_rejected(self):
        cust = app.test_client()
        with cust.session_transaction() as sess:
            sess['user_id'] = 1

        # Attempt to tamper with price of Product 1 (Catalog: 550, Tampered: 15.0)
        payload = {
            'user_id': 1,
            'delivery_address': 'Model Town',
            'customer_phone': '+91 9876543210',
            'items': [
                {'product_id': 1, 'quantity': 1, 'price': 15.0}
            ]
        }
        res = cust.post('/api/checkout', json=payload)
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data['success'])
        self.assertIn('tampering', data['error'].lower())
        print("  -> Passed! Price tampering rejected with 400 Bad Request.")

    def test_06_insufficient_stock_rejected(self):
        cust = app.test_client()
        with cust.session_transaction() as sess:
            sess['user_id'] = 1

        # Set Product 2 out of stock in DB
        conn = sqlite3.connect(TEST_DB_PATH)
        conn.execute("UPDATE Products SET availability = 0 WHERE product_id = 2")
        conn.commit()
        conn.close()

        payload = {
            'user_id': 1,
            'delivery_address': 'Model Town',
            'customer_phone': '+91 9876543210',
            'items': [
                {'product_id': 2, 'quantity': 1}
            ]
        }
        res = cust.post('/api/checkout', json=payload)
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data['success'])
        self.assertIn('out of stock', data['error'].lower())

        # Restore product availability
        conn = sqlite3.connect(TEST_DB_PATH)
        conn.execute("UPDATE Products SET availability = 1 WHERE product_id = 2")
        conn.commit()
        conn.close()
        print("  -> Passed! Out of stock product rejected with 400 Bad Request.")

    def test_07_checkout_transaction_rollback_on_failure(self):
        cust = app.test_client()
        with cust.session_transaction() as sess:
            sess['user_id'] = 1

        conn = sqlite3.connect(TEST_DB_PATH)
        groups_before = conn.execute("SELECT COUNT(*) FROM Order_Groups").fetchone()[0]
        orders_before = conn.execute("SELECT COUNT(*) FROM Orders").fetchone()[0]
        conn.close()

        # Payload with 1 valid product and 1 non-existent product
        payload = {
            'user_id': 1,
            'delivery_address': 'Model Town',
            'customer_phone': '+91 9876543210',
            'items': [
                {'product_id': 1, 'quantity': 1},
                {'product_id': 99999, 'quantity': 1}  # Invalid product
            ]
        }
        res = cust.post('/api/checkout', json=payload)
        self.assertEqual(res.status_code, 400)

        conn = sqlite3.connect(TEST_DB_PATH)
        groups_after = conn.execute("SELECT COUNT(*) FROM Order_Groups").fetchone()[0]
        orders_after = conn.execute("SELECT COUNT(*) FROM Orders").fetchone()[0]
        conn.close()

        self.assertEqual(groups_before, groups_after, "Order_Groups must roll back on failure")
        self.assertEqual(orders_before, orders_after, "Orders must roll back on failure")
        print("  -> Passed! Atomic transaction integrity verified (zero partial records).")

    def test_08_duplicate_checkout_prevented_idempotency(self):
        cust = app.test_client()
        with cust.session_transaction() as sess:
            sess['user_id'] = 1

        idem_key = "idemp_test_stage10_unique_8821"
        payload = {
            'user_id': 1,
            'delivery_address': 'Model Town',
            'customer_phone': '+91 9876543210',
            'idempotency_key': idem_key,
            'items': [{'product_id': 1, 'quantity': 1}]
        }

        # First checkout attempt
        res1 = cust.post('/api/checkout', json=payload)
        self.assertEqual(res1.status_code, 200)
        group_id_1 = res1.get_json()['group_id']

        # Duplicate checkout attempt with identical key
        res2 = cust.post('/api/checkout', json=payload)
        self.assertEqual(res2.status_code, 200)
        data2 = res2.get_json()
        self.assertTrue(data2.get('idempotent'))
        self.assertEqual(data2['group_id'], group_id_1)

        # Verify DB has only 1 group for this key
        conn = sqlite3.connect(TEST_DB_PATH)
        count = conn.execute("SELECT COUNT(*) FROM Order_Groups WHERE idempotency_key = ?", (idem_key,)).fetchone()[0]
        conn.close()
        self.assertEqual(count, 1)
        print("  -> Passed! Idempotency key prevents duplicate order creation.")

    def test_09_cross_city_checkout_rejected(self):
        cust = app.test_client()
        with cust.session_transaction() as sess:
            sess['user_id'] = 1

        # Attempt to checkout with Product 1 (Ludhiana) AND Product 901 (New Delhi)
        payload = {
            'user_id': 1,
            'delivery_address': 'Ludhiana/Delhi',
            'customer_phone': '+91 9876543210',
            'items': [
                {'product_id': 1, 'quantity': 1},    # Ludhiana (city_id = 1)
                {'product_id': 901, 'quantity': 1}   # New Delhi (city_id = 2)
            ]
        }
        res = cust.post('/api/checkout', json=payload)
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data['success'])
        self.assertIn('cross-city', data['error'].lower())

        # Attempt to checkout with Ludhiana vendors when destination is New Delhi
        payload_city = {
            'user_id': 1,
            'delivery_address': 'Connaught Place, New Delhi',
            'customer_phone': '+91 9876543210',
            'city_id': 2,  # Destination is New Delhi
            'items': [{'product_id': 1, 'quantity': 1}]  # Vendor is in Ludhiana (city_id = 1)
        }
        res_city = cust.post('/api/checkout', json=payload_city)
        self.assertEqual(res_city.status_code, 400)
        self.assertIn('city', res_city.get_json()['error'].lower())
        print("  -> Passed! Cross-city orders strictly blocked with 400 Bad Request.")

    def test_10_separate_delivery_assignment(self):
        # Create a fresh 2-vendor checkout
        cust = app.test_client()
        with cust.session_transaction() as sess:
            sess['user_id'] = 1

        res = cust.post('/api/checkout', json={
            'user_id': 1,
            'delivery_address': 'Model Town',
            'customer_phone': '+91 9876543210',
            'items': [
                {'product_id': 1, 'quantity': 1},  # Vendor 1
                {'product_id': 8, 'quantity': 1}   # Vendor 2
            ]
        })
        if res.status_code != 200:
            print("TEST 10 CHECKOUT ERROR:", res.get_json())
        self.assertEqual(res.status_code, 200)
        child_orders = res.get_json()['child_orders']
        self.assertEqual(len(child_orders), 2)
        c1_id = child_orders[0]['order_id']
        c2_id = child_orders[1]['order_id']

        # Partner 1 (Rajesh) logs in and accepts Child Order 1
        p1_login = self.client.post('/api/delivery/login', json={'email': 'delivery@locallift.com', 'password': 'password123'})
        t1 = p1_login.get_json()['token']
        h1 = {'Authorization': f'Bearer {t1}', 'Content-Type': 'application/json'}
        self.client.patch('/api/delivery/availability', headers=h1, json={'is_online': 1})

        accept1 = self.client.post(f'/api/delivery/orders/{c1_id}/accept', headers=h1)
        self.assertEqual(accept1.status_code, 200)

        # Partner 2 (Vikram) accepts Child Order 2
        t2 = generate_delivery_token(2, 88)
        h2 = {'Authorization': f'Bearer {t2}', 'Content-Type': 'application/json'}
        self.client.patch('/api/delivery/availability', headers=h2, json={'is_online': 1})
        accept2 = self.client.post(f'/api/delivery/orders/{c2_id}/accept', headers=h2)
        self.assertEqual(accept2.status_code, 200)

        # Verify in DB that both child orders have distinct delivery partners
        conn = sqlite3.connect(TEST_DB_PATH)
        conn.row_factory = sqlite3.Row
        o1 = conn.execute("SELECT delivery_partner_id, delivery_status FROM Orders WHERE order_id = ?", (c1_id,)).fetchone()
        o2 = conn.execute("SELECT delivery_partner_id, delivery_status FROM Orders WHERE order_id = ?", (c2_id,)).fetchone()
        conn.close()

        self.assertEqual(o1['delivery_partner_id'], 1)
        self.assertEqual(o1['delivery_status'], 'assigned')
        self.assertEqual(o2['delivery_partner_id'], 2)
        self.assertEqual(o2['delivery_status'], 'assigned')
        print(f"  -> Passed! Child order #{c1_id} assigned to Partner 1, child order #{c2_id} assigned to Partner 2.")

    def test_11_existing_gps_tracking_works_for_child_orders(self):
        # Partner 1 transmits location on Child Order 1
        t1 = generate_delivery_token(1, 100)
        h1 = {'Authorization': f'Bearer {t1}', 'Content-Type': 'application/json'}

        # Get Child Order 1 ID
        conn = sqlite3.connect(TEST_DB_PATH)
        order = conn.execute("SELECT order_id, group_id, user_id FROM Orders WHERE delivery_partner_id = 1 AND delivery_status = 'assigned' LIMIT 1").fetchone()
        self.assertIsNotNone(order, "Assigned order for partner 1 must exist")
        c1_id = order[0]
        group_id = order[1]
        user_id = order[2]
        conn.close()

        # Transmit GPS telemetry
        loc_res = self.client.patch('/api/delivery/location', headers=h1, json={
            'latitude': 30.9025,
            'longitude': 75.8585
        })
        self.assertEqual(loc_res.status_code, 200)

        # Customer tracks child order directly via existing tracking endpoint
        cust = app.test_client()
        with cust.session_transaction() as sess:
            sess['user_id'] = user_id

        track_res = cust.get(f'/api/orders/{c1_id}/tracking')
        self.assertEqual(track_res.status_code, 200)
        track_data = track_res.get_json()
        self.assertTrue(track_data['is_live'])
        self.assertAlmostEqual(track_data['partner']['latitude'], 30.9025, places=4)

        # Customer tracks overall parent order group
        group_track_res = cust.get(f'/api/order-groups/{group_id}/tracking')
        self.assertEqual(group_track_res.status_code, 200)
        gt_data = group_track_res.get_json()
        self.assertTrue(gt_data['success'])
        self.assertIn('child_tracking', gt_data)
        self.assertEqual(len(gt_data['child_tracking']), 2)
        print(f"  -> Passed! Live GPS telemetry operates seamlessly on child orders and parent tracking aggregate.")

    def test_12_unauthorized_customer_cannot_access_parent_order(self):
        conn = sqlite3.connect(TEST_DB_PATH)
        group = conn.execute("SELECT group_id, user_id FROM Order_Groups ORDER BY group_id DESC LIMIT 1").fetchone()
        group_id = group[0]
        owner_id = group[1]
        conn.close()

        # Customer with user_id = 99 (not the owner)
        stranger_client = app.test_client()
        with stranger_client.session_transaction() as sess:
            sess['user_id'] = 99

        # Details endpoint
        res1 = stranger_client.get(f'/api/order-groups/{group_id}')
        self.assertEqual(res1.status_code, 403)
        self.assertFalse(res1.get_json()['success'])

        # Tracking endpoint
        res2 = stranger_client.get(f'/api/order-groups/{group_id}/tracking')
        self.assertEqual(res2.status_code, 403)
        self.assertFalse(res2.get_json()['success'])

        # Unauthenticated request
        anon_client = app.test_client()
        res3 = anon_client.get(f'/api/order-groups/{group_id}')
        self.assertEqual(res3.status_code, 403)
        print("  -> Passed! Unauthorized customers and anonymous requests blocked from parent orders with 403.")

if __name__ == '__main__':
    unittest.main()
