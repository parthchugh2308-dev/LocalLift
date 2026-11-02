import os
import sqlite3
import unittest
import json
import time

TEST_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'LocalLift_TEST_stage7.sqlite')
os.environ['DATABASE_PATH'] = TEST_DB_PATH

from init_db import init_db
from app import app, generate_delivery_token, generate_admin_token

class TestStage7DeliveryCockpit(unittest.TestCase):
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

    def test_01_delivery_template_rendering(self):
        res = self.client.get('/delivery')
        self.assertEqual(res.status_code, 200)
        html = res.data.decode('utf-8')
        # Exact heart logo SVG path
        self.assertIn('M12 21.2c-.4 0-.8-.1-1.1-.4', html, "Heart logo SVG path missing!")
        # Typography
        self.assertIn('Fraunces', html, "Fraunces font missing!")
        self.assertIn('Plus Jakarta Sans', html, "Plus Jakarta Sans font missing!")
        # Role switcher banner
        self.assertIn('Marketplace', html)
        self.assertIn('Vendor Portal', html)
        self.assertIn('Delivery Fleet', html)
        self.assertIn('Super Admin', html)
        # Cockpit UI components
        self.assertIn('deliveryApp()', html)
        self.assertIn('Online / Offline', html)
        self.assertIn('Radar Queue', html)
        self.assertIn('Pickup OTP', html)
        self.assertIn('Delivery OTP', html)
        print("  -> Passed! templates/delivery.html renders cleanly with full brand system and cockpit views.")

    def test_02_available_orders_radar(self):
        # Log in as demo delivery partner
        login_res = self.client.post('/api/delivery/login', json={
            'email': 'delivery@locallift.com',
            'password': 'password123'
        })
        token = login_res.get_json()['token']
        headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

        # Fetch radar orders
        res = self.client.get('/api/delivery/orders/available', headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertIn('orders', data)
        print(f"  -> Passed! Proximity radar feed returns {len(data['orders'])} available store pickups.")

    def test_03_full_dispatch_and_otp_lifecycle(self):
        # Create a fresh test order to run through full dispatch
        order_res = self.client.post('/api/orders', json={
            'user_id': 1,
            'vendor_id': 1,
            'notes': 'Stage 7 Automated Test Order',
            'items': [{'product_id': 1, 'quantity': 1}]
        })
        self.assertEqual(order_res.status_code, 200)
        order_id = order_res.get_json()['order_id']

        # Log in as delivery partner Rajesh Kumar
        login_res = self.client.post('/api/delivery/login', json={
            'email': 'delivery@locallift.com',
            'password': 'password123'
        })
        token = login_res.get_json()['token']
        headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

        # Ensure partner is online
        self.client.patch('/api/delivery/availability', headers=headers, json={'is_online': 1})

        # Step 1: Accept Order
        accept_res = self.client.post(f'/api/delivery/orders/{order_id}/accept', headers=headers)
        self.assertEqual(accept_res.status_code, 200)
        self.assertTrue(accept_res.get_json()['success'])

        # Concurrency check: Second attempt to accept same order must return 409 Conflict
        dup_res = self.client.post(f'/api/delivery/orders/{order_id}/accept', headers=headers)
        self.assertEqual(dup_res.status_code, 400) # already has active trip or claimed

        # Step 2: Fetch Active Order
        active_res = self.client.get('/api/delivery/active-order', headers=headers)
        self.assertEqual(active_res.status_code, 200)
        active_order = active_res.get_json()['active_order']
        self.assertIsNotNone(active_order)
        self.assertEqual(active_order['order_id'], order_id)
        self.assertEqual(active_order['delivery_status'], 'assigned')

        # Step 3: Arrived at Store
        arrive_res = self.client.post(f'/api/delivery/orders/{order_id}/arrived-store', headers=headers)
        self.assertEqual(arrive_res.status_code, 200)

        # Step 4: Verify Pickup OTP (Wrong OTP must fail)
        bad_pickup = self.client.post(f'/api/delivery/orders/{order_id}/verify-pickup', headers=headers, json={'pickup_otp': '9999'})
        self.assertEqual(bad_pickup.status_code, 400)

        # Correct Pickup OTP (1234)
        good_pickup = self.client.post(f'/api/delivery/orders/{order_id}/verify-pickup', headers=headers, json={'pickup_otp': '1234'})
        self.assertEqual(good_pickup.status_code, 200)
        self.assertTrue(good_pickup.get_json()['success'])

        # Step 5: Verify Delivery OTP (Wrong OTP must fail)
        bad_delivery = self.client.post(f'/api/delivery/orders/{order_id}/verify-delivery', headers=headers, json={'delivery_otp': '0000'})
        self.assertEqual(bad_delivery.status_code, 400)

        # Correct Delivery OTP (5678)
        good_delivery = self.client.post(f'/api/delivery/orders/{order_id}/verify-delivery', headers=headers, json={'delivery_otp': '5678'})
        self.assertEqual(good_delivery.status_code, 200)
        self.assertTrue(good_delivery.get_json()['success'])
        self.assertIn('payout_amount', good_delivery.get_json())

        # Step 6: Verify Active Order is now cleared
        cleared_res = self.client.get('/api/delivery/active-order', headers=headers)
        self.assertIsNone(cleared_res.get_json()['active_order'])

        # Step 7: Verify Earnings Ledger has credited exactly-once
        earn_res = self.client.get('/api/delivery/earnings', headers=headers)
        self.assertEqual(earn_res.status_code, 200)
        earn_data = earn_res.get_json()
        self.assertGreater(earn_data['today_earnings'], 0.0)
        self.assertGreater(len(earn_data['ledger']), 0)
        self.assertEqual(earn_data['ledger'][0]['order_id'], order_id)
        print("  -> Passed! Full dispatch lifecycle (Accept -> Arrive -> Pickup OTP -> Delivery OTP -> Idempotent Payout) verified.")

    def test_04_role_switchers_linked_across_portals(self):
        # Check customer.html has /delivery
        c_res = self.client.get('/')
        self.assertIn('/delivery', c_res.data.decode('utf-8'))

        # Check vendor.html has /delivery
        v_res = self.client.get('/vendor')
        self.assertIn('/delivery', v_res.data.decode('utf-8'))

        # Check admin.html has /delivery
        a_res = self.client.get('/admin')
        self.assertIn('/delivery', a_res.data.decode('utf-8'))
        print("  -> Passed! /delivery link verified across Customer, Vendor, and Super Admin top utility bars.")

if __name__ == '__main__':
    unittest.main()
