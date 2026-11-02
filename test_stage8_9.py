import os
import sqlite3
import unittest
import json
import time

TEST_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'LocalLift_TEST_stage8_9.sqlite')
os.environ['DATABASE_PATH'] = TEST_DB_PATH

from init_db import init_db
from app import app, generate_delivery_token, generate_admin_token

class TestStage8_9LiveGPSTracking(unittest.TestCase):
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

    def test_01_unauthenticated_location_update_rejected(self):
        # Fresh unauthenticated client
        fresh_client = app.test_client()
        res = fresh_client.patch('/api/delivery/location', json={'latitude': 30.9015, 'longitude': 75.8575})
        self.assertEqual(res.status_code, 401)
        data = res.get_json()
        self.assertFalse(data['success'])
        self.assertIn('authentication required', data['error'].lower())
        print("  -> Passed! Unauthenticated location update properly rejected with 401.")

    def test_02_location_update_without_active_order_rejected(self):
        # Delivery partner 1 login
        login_res = self.client.post('/api/delivery/login', json={
            'email': 'delivery@locallift.com',
            'password': 'password123'
        })
        self.assertEqual(login_res.status_code, 200)
        token = login_res.get_json()['token']
        headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

        # Ensure partner is online, but no active order is assigned yet
        self.client.patch('/api/delivery/availability', headers=headers, json={'is_online': 1})

        # Clear any active orders assigned to partner 1 in DB
        conn = sqlite3.connect(TEST_DB_PATH)
        conn.execute("UPDATE Orders SET delivery_partner_id = NULL, delivery_status = 'unassigned' WHERE delivery_partner_id = 1")
        conn.commit()
        conn.close()

        res = self.client.patch('/api/delivery/location', headers=headers, json={
            'latitude': 30.9010,
            'longitude': 75.8570
        })
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data['success'])
        self.assertIn('No active unfulfilled order', data['error'])
        print("  -> Passed! Location update without an active order rejected with 400.")

    def test_03_authorized_partner_location_update_success(self):
        # Create an order and assign it to delivery partner 1
        order_res = self.client.post('/api/orders', json={
            'user_id': 1,
            'vendor_id': 1,
            'notes': 'Stage 8/9 Live GPS Test Order',
            'items': [{'product_id': 1, 'quantity': 2}]
        })
        self.assertEqual(order_res.status_code, 200)
        order_id = order_res.get_json()['order_id']

        login_res = self.client.post('/api/delivery/login', json={
            'email': 'delivery@locallift.com',
            'password': 'password123'
        })
        token = login_res.get_json()['token']
        headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

        # Ensure partner is online
        self.client.patch('/api/delivery/availability', headers=headers, json={'is_online': 1})

        # Accept order
        accept_res = self.client.post(f'/api/delivery/orders/{order_id}/accept', headers=headers)
        self.assertEqual(accept_res.status_code, 200)

        # Transmit valid GPS coordinates
        loc_res = self.client.patch('/api/delivery/location', headers=headers, json={
            'latitude': 30.9015,
            'longitude': 75.8578,
            'accuracy': 5.2,
            'heading': 90.0,
            'speed': 4.5
        })
        self.assertEqual(loc_res.status_code, 200)
        data = loc_res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['order_id'], order_id)
        self.assertAlmostEqual(data['latitude'], 30.9015, places=4)

        # Verify DB location recording
        conn = sqlite3.connect(TEST_DB_PATH)
        conn.row_factory = sqlite3.Row
        partner = conn.execute("SELECT current_lat, current_lng, last_location_time FROM Delivery_Partners WHERE partner_id = 1").fetchone()
        self.assertAlmostEqual(partner['current_lat'], 30.9015, places=4)
        self.assertAlmostEqual(partner['current_lng'], 75.8578, places=4)

        # Verify breadcrumb table
        crumb = conn.execute("SELECT * FROM Delivery_Partner_Locations WHERE order_id = ? ORDER BY location_id DESC LIMIT 1", (order_id,)).fetchone()
        self.assertIsNotNone(crumb)
        self.assertAlmostEqual(crumb['lat'], 30.9015, places=4)
        conn.close()
        print("  -> Passed! Authorized partner location update recorded in DB & breadcrumbs.")

    def test_04_customer_tracks_own_order_success(self):
        # Get active order from DB
        conn = sqlite3.connect(TEST_DB_PATH)
        conn.row_factory = sqlite3.Row
        order = conn.execute("SELECT order_id, user_id FROM Orders WHERE delivery_status = 'assigned' LIMIT 1").fetchone()
        order_id = order['order_id']
        user_id = order['user_id']
        conn.close()

        # Customer session login
        cust_client = app.test_client()
        with cust_client.session_transaction() as sess:
            sess['user_id'] = user_id
            sess['user_role'] = 'customer'

        res = cust_client.get(f'/api/orders/{order_id}/tracking')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['order_id'], order_id)
        self.assertIn('store', data)
        self.assertIn('customer', data)
        self.assertIn('partner', data)
        self.assertTrue(data['is_live'])
        self.assertFalse(data['is_stale'])
        self.assertIn('Approx.', data['eta_text'])
        self.assertGreater(len(data['route_polyline']), 0)
        self.assertIsNotNone(data['partner']['latitude'])
        self.assertNotIn('delivery_otp_demo', data, "Tracking API must never return delivery OTP plaintext")
        self.assertNotIn('delivery_otp_hash', data, "Tracking API must never return OTP hash")

        # Verify secure dedicated customer delivery OTP endpoint
        otp_res = cust_client.get(f'/api/orders/{order_id}/delivery-otp')
        self.assertEqual(otp_res.status_code, 200)
        otp_data = otp_res.get_json()
        self.assertTrue(otp_data['success'])
        self.assertIn('delivery_otp', otp_data)
        self.assertEqual(otp_data['order_id'], order_id)

        # Verify unauthorized user cannot access delivery OTP
        unauth_client = app.test_client()
        with unauth_client.session_transaction() as sess:
            sess['user_id'] = 99
        bad_otp_res = unauth_client.get(f'/api/orders/{order_id}/delivery-otp')
        self.assertEqual(bad_otp_res.status_code, 403)
        print(f"  -> Passed! Customer tracked order #{order_id} successfully (ETA: {data['eta_text']}) & OTP secured.")

    def test_05_unauthorized_customer_cannot_track_order(self):
        # Get active order from DB
        conn = sqlite3.connect(TEST_DB_PATH)
        conn.row_factory = sqlite3.Row
        order = conn.execute("SELECT order_id, user_id FROM Orders WHERE delivery_status = 'assigned' LIMIT 1").fetchone()
        order_id = order['order_id']
        owner_id = order['user_id']
        conn.close()

        # Another customer (e.g. user_id = 99)
        other_cust_client = app.test_client()
        with other_cust_client.session_transaction() as sess:
            sess['user_id'] = 99
            sess['user_role'] = 'customer'

        res = other_cust_client.get(f'/api/orders/{order_id}/tracking')
        self.assertEqual(res.status_code, 403)
        data = res.get_json()
        self.assertFalse(data['success'])
        self.assertIn('Forbidden', data['error'])
        print("  -> Passed! Unauthorized customer denied tracking with 403 Forbidden.")

    def test_06_unassigned_delivery_partner_cannot_track_order(self):
        # Get active order from DB
        conn = sqlite3.connect(TEST_DB_PATH)
        conn.row_factory = sqlite3.Row
        order = conn.execute("SELECT order_id FROM Orders WHERE delivery_status = 'assigned' LIMIT 1").fetchone()
        order_id = order['order_id']
        conn.close()

        # Token for a different delivery partner (partner_id = 999, user_id = 999)
        unrelated_token = generate_delivery_token(999, 999)
        res = self.client.get(f'/api/orders/{order_id}/tracking', headers={'Authorization': f'Bearer {unrelated_token}'})
        self.assertEqual(res.status_code, 403)
        data = res.get_json()
        self.assertFalse(data['success'])
        self.assertIn('Forbidden', data['error'])
        print("  -> Passed! Unassigned delivery partner denied tracking with 403 Forbidden.")

    def test_07_delivered_order_privacy_scrub(self):
        # Get active order from DB
        conn = sqlite3.connect(TEST_DB_PATH)
        conn.row_factory = sqlite3.Row
        order = conn.execute("SELECT order_id, user_id FROM Orders WHERE delivery_status = 'assigned' LIMIT 1").fetchone()
        order_id = order['order_id']
        user_id = order['user_id']
        conn.close()

        # Transition order to delivered in DB
        conn = sqlite3.connect(TEST_DB_PATH)
        conn.execute("UPDATE Orders SET delivery_status = 'delivered', status = 'Delivered' WHERE order_id = ?", (order_id,))
        conn.commit()
        conn.close()

        cust_client = app.test_client()
        with cust_client.session_transaction() as sess:
            sess['user_id'] = user_id
            sess['user_role'] = 'customer'

        res = cust_client.get(f'/api/orders/{order_id}/tracking')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['delivery_status'], 'delivered')
        self.assertFalse(data['is_live'])
        self.assertIsNone(data['partner']['latitude'], "Delivered order must NOT expose rider latitude")
        self.assertIsNone(data['partner']['longitude'], "Delivered order must NOT expose rider longitude")
        self.assertEqual(data['eta_text'], 'Delivered')
        print("  -> Passed! Delivered order strictly scrubs GPS coordinates for privacy compliance.")

    def test_08_stale_location_detection(self):
        # Create fresh order
        order_res = self.client.post('/api/orders', json={
            'user_id': 1,
            'vendor_id': 1,
            'notes': 'Stale Location Test',
            'items': [{'product_id': 1, 'quantity': 1}]
        })
        order_id = order_res.get_json()['order_id']

        login_res = self.client.post('/api/delivery/login', json={
            'email': 'delivery@locallift.com',
            'password': 'password123'
        })
        token = login_res.get_json()['token']
        headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
        self.client.patch('/api/delivery/availability', headers=headers, json={'is_online': 1})
        self.client.post(f'/api/delivery/orders/{order_id}/accept', headers=headers)

        # Set partner's last_location_time to 5 minutes ago (300 seconds ago)
        conn = sqlite3.connect(TEST_DB_PATH)
        conn.execute("""
            UPDATE Delivery_Partners 
            SET current_lat = 30.9010, current_lng = 75.8570,
                last_location_time = datetime('now', '-300 seconds')
            WHERE partner_id = 1
        """)
        conn.commit()
        conn.close()

        # Track order as customer
        cust_client = app.test_client()
        with cust_client.session_transaction() as sess:
            sess['user_id'] = 1

        res = cust_client.get(f'/api/orders/{order_id}/tracking')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['is_live'])
        self.assertTrue(data['is_stale'], "Tracking must flag is_stale: True when GPS last seen > 120s")
        self.assertIn('paused / reconnecting', data['status_message'])
        print("  -> Passed! Stale GPS signal accurately detected and flagged to customer.")

    def test_09_invalid_gps_and_teleportation_jump_rejected(self):
        login_res = self.client.post('/api/delivery/login', json={
            'email': 'delivery@locallift.com',
            'password': 'password123'
        })
        token = login_res.get_json()['token']
        headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

        # Out-of-bounds coordinates
        res_bad = self.client.patch('/api/delivery/location', headers=headers, json={
            'latitude': 120.5,
            'longitude': 75.8570
        })
        self.assertEqual(res_bad.status_code, 400)
        self.assertIn('out of valid range', res_bad.get_json()['error'])

        # Set base location at 30.9010, 75.8570 with last_location_time = 10 seconds ago
        conn = sqlite3.connect(TEST_DB_PATH)
        conn.execute("""
            UPDATE Delivery_Partners 
            SET current_lat = 30.9010, current_lng = 75.8570,
                last_location_time = datetime('now', '-10 seconds')
            WHERE partner_id = 1
        """)
        conn.commit()
        conn.close()

        # Attempt to jump 50 km away in 10 seconds (Velocity = 18,000 km/h)
        res_jump = self.client.patch('/api/delivery/location', headers=headers, json={
            'latitude': 31.4010,
            'longitude': 75.8570
        })
        self.assertEqual(res_jump.status_code, 400)
        self.assertIn('Unrealistic location jump detected', res_jump.get_json()['error'])
        print("  -> Passed! Out-of-bounds GPS coordinates and teleportation jumps rejected with 400.")

if __name__ == '__main__':
    unittest.main()
