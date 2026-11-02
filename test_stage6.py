import os
import sqlite3
import unittest
import json
import time

# Set test database path to avoid polluting main database
TEST_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'LocalLift_TEST_stage6.sqlite')
os.environ['DATABASE_PATH'] = TEST_DB_PATH

from init_db import init_db
from app import app, generate_admin_token

class TestStage6DeliveryFleet(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Initialize isolated test database
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

    def get_admin_headers(self):
        token = generate_admin_token(999)
        return {
            'Authorization': f'Bearer {token}',
            'X-Admin-Token': token,
            'Content-Type': 'application/json'
        }

    def test_01_geo_cities_api(self):
        res = self.client.get('/api/geo/cities')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        cities = {c['slug']: c for c in data['cities']}
        self.assertIn('ludhiana', cities)
        self.assertIn('delhi', cities)
        self.assertGreater(len(cities['ludhiana']['zones']), 0)
        print("  -> Passed! /api/geo/cities returns active Indian cities and zoned delivery clusters.")

    def test_02_delivery_partner_registration(self):
        payload = {
            'full_name': 'Amanpreet Singh',
            'email': 'amanpreet@locallift.com',
            'phone': '+919811122233',
            'password': 'securepassword123',
            'city_id': 1,
            'zone_id': 1,
            'vehicle_type': 'Motorcycle',
            'vehicle_number': 'PB10-EP-9988',
            'driving_license_number': 'DL-PB10-2023-88990'
        }
        res = self.client.post('/api/delivery/register', json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['status'], 'pending')

        # Test duplicate registration rejection
        dup_res = self.client.post('/api/delivery/register', json=payload)
        self.assertEqual(dup_res.status_code, 409)

        # Test missing fields
        bad_res = self.client.post('/api/delivery/register', json={'full_name': 'Test'})
        self.assertEqual(bad_res.status_code, 400)
        print("  -> Passed! Delivery Partner onboarding, validation and duplicate prevention verified.")

    def test_03_delivery_partner_login(self):
        # Demo delivery partner
        res = self.client.post('/api/delivery/login', json={
            'email': 'delivery@locallift.com',
            'password': 'password123'
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertIn('token', data)
        self.assertEqual(data['partner']['vehicle_number'], 'PB10-DL-5521')

        # Invalid password
        bad_res = self.client.post('/api/delivery/login', json={
            'email': 'delivery@locallift.com',
            'password': 'wrongpassword'
        })
        self.assertEqual(bad_res.status_code, 401)

        # Login with customer account fails
        cust_res = self.client.post('/api/delivery/login', json={
            'email': 'customer@locallift.com',
            'password': 'password123'
        })
        self.assertEqual(cust_res.status_code, 403)
        print("  -> Passed! Delivery Partner authentication and role isolation verified.")

    def test_04_delivery_profile_and_availability(self):
        # Log in as demo delivery partner
        login_res = self.client.post('/api/delivery/login', json={
            'email': 'delivery@locallift.com',
            'password': 'password123'
        })
        token = login_res.get_json()['token']
        headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

        # Get Profile
        prof_res = self.client.get('/api/delivery/profile', headers=headers)
        self.assertEqual(prof_res.status_code, 200)
        self.assertEqual(prof_res.get_json()['partner']['full_name'], 'Rajesh Kumar')

        # Update Profile
        update_res = self.client.patch('/api/delivery/profile', headers=headers, json={
            'vehicle_type': 'Electric Vehicle'
        })
        self.assertEqual(update_res.status_code, 200)

        # Toggle Online/Offline
        toggle_res = self.client.patch('/api/delivery/availability', headers=headers, json={'is_online': 1})
        self.assertEqual(toggle_res.status_code, 200)
        self.assertEqual(toggle_res.get_json()['is_online'], 1)

        toggle_off = self.client.patch('/api/delivery/availability', headers=headers, json={'is_online': 0})
        self.assertEqual(toggle_off.status_code, 200)
        self.assertEqual(toggle_off.get_json()['is_online'], 0)
        print("  -> Passed! Delivery Partner profile updates and online shift toggle verified.")

    def test_05_admin_delivery_fleet_controls(self):
        # 1. Non-admin session (currently logged in as delivery partner from test_04) is strictly blocked with 403 Forbidden
        forbidden_res = self.client.get('/api/admin/delivery-partners')
        self.assertEqual(forbidden_res.status_code, 403)

        # 2. Fresh client with zero session/cookies is blocked with 401 Unauthorized
        fresh_client = app.test_client()
        unauth_res = fresh_client.get('/api/admin/delivery-partners')
        self.assertEqual(unauth_res.status_code, 401)

        # Authenticated Admin fetch
        admin_headers = self.get_admin_headers()
        res = self.client.get('/api/admin/delivery-partners', headers=admin_headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        partners = data['delivery_partners']
        self.assertGreaterEqual(len(partners), 2) # Demo + Amanpreet

        # Find Amanpreet (pending partner)
        aman = next(p for p in partners if p['email'] == 'amanpreet@locallift.com')
        self.assertEqual(aman['status'], 'pending')

        # Approve Amanpreet
        approve_res = self.client.patch(
            f"/api/admin/delivery-partners/{aman['partner_id']}/status",
            headers=admin_headers,
            json={'status': 'approved'}
        )
        self.assertEqual(approve_res.status_code, 200)

        # Suspend Amanpreet
        suspend_res = self.client.patch(
            f"/api/admin/delivery-partners/{aman['partner_id']}/status",
            headers=admin_headers,
            json={'status': 'suspended'}
        )
        self.assertEqual(suspend_res.status_code, 200)

        # Check stats includes fleet
        stats_res = self.client.get('/api/admin/stats', headers=admin_headers)
        self.assertEqual(stats_res.status_code, 200)
        stats = stats_res.get_json()
        self.assertIn('total_delivery_partners', stats)
        self.assertIn('active_delivery_partners', stats)
        self.assertIn('pending_delivery_partners', stats)
        print("  -> Passed! Admin fleet oversight, status controls, and KPI metrics verified.")

    def test_06_delivery_page_route(self):
        # Test /delivery route renders 200 or template
        # Even if delivery.html is pending Stage 7, let's verify route is defined
        from flask import current_app
        with app.test_request_context():
            rules = [r.rule for r in app.url_map.iter_rules()]
            self.assertIn('/delivery', rules)
        print("  -> Passed! GET /delivery route registered in Flask app.")

if __name__ == '__main__':
    unittest.main()
