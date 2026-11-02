# -*- coding: utf-8 -*-
"""
Comprehensive Production Readiness & Security Verification Suite
Tests:
1. Unauthenticated admin API access (401)
2. Non-admin access (403)
3. Authorized admin access via session & HMAC token (200)
4. Manipulated order total protection (server-side recalculation)
5. Out of stock / unavailable product rejection (400)
6. Zero quantity / invalid item rejection (400)
7. Order status transition validation (400 / 404)
8. Favicon route (200)
9. Service Worker & Manifest branding verification
10. Progressive Werkzeug password upgrade
11. Isolated DB cleanup
"""
import os
import shutil
import json
import sqlite3
import gc

TEST_DB = os.path.abspath('LocalLift_TEST_security.sqlite')
if os.path.exists('LocalLift_DB.sqlite'):
    shutil.copy2('LocalLift_DB.sqlite', TEST_DB)

os.environ['DATABASE_PATH'] = TEST_DB

from app import app, get_db, get_db_path

app.config['TESTING'] = True

def test_unauthenticated_admin_access():
    print("[SECURITY TEST 1] Testing Unauthenticated Admin API Access ...")
    client = app.test_client()
    endpoints = [
        ('GET', '/api/admin/stats'),
        ('GET', '/api/admin/vendors'),
        ('PATCH', '/api/admin/vendors/1/status', {'status': 'approved'}),
        ('DELETE', '/api/admin/vendors/9999'),
        ('GET', '/api/admin/users'),
        ('GET', '/api/admin/orders')
    ]
    for method, ep, *data in endpoints:
        if method == 'GET':
            resp = client.get(ep)
        elif method == 'PATCH':
            resp = client.patch(ep, json=data[0])
        elif method == 'DELETE':
            resp = client.delete(ep)
        assert resp.status_code == 401, f"Expected 401 for {method} {ep}, got {resp.status_code}"
        res = resp.get_json()
        assert res.get('success') is False
        assert "Unauthorized" in res.get('error', '')
    print("  -> Passed! All 6 admin API endpoints strictly block unauthenticated requests with 401.")

def test_non_admin_forbidden_access():
    print("[SECURITY TEST 2] Testing Non-Admin User Access (Customer / Vendor to Admin API) ...")
    client = app.test_client()
    # Login as customer
    login_resp = client.post('/api/auth/login', json={"email": "customer@locallift.com", "password": "password123"})
    assert login_resp.status_code == 200
    assert login_resp.get_json().get("user_type") == "customer"

    # Attempt to access admin endpoints
    resp = client.get('/api/admin/stats')
    assert resp.status_code == 403, f"Expected 403 Forbidden for customer, got {resp.status_code}"
    res = resp.get_json()
    assert res.get('success') is False
    assert "Forbidden" in res.get('error', '')
    print("  -> Passed! Non-admin users are strictly blocked with 403 Forbidden.")

def test_authorized_admin_access():
    print("[SECURITY TEST 3] Testing Authorized Admin Access (Session + HMAC Token) ...")
    client = app.test_client()
    login_resp = client.post('/api/admin/login', json={"email": "admin@locallift.com", "password": "admin123"})
    assert login_resp.status_code == 200
    res = login_resp.get_json()
    token = res.get('token')
    assert token, "Admin token missing"

    # 1. Access with active session cookie
    resp_session = client.get('/api/admin/stats')
    assert resp_session.status_code == 200, f"Expected 200, got {resp_session.status_code}"

    # 2. Access with token header in separate unauthenticated client
    unauth_client = app.test_client()
    resp_token = unauth_client.get('/api/admin/stats', headers={'X-Admin-Token': token})
    assert resp_token.status_code == 200, f"Expected 200 with X-Admin-Token, got {resp_token.status_code}"

    # 3. Access with Bearer token header
    resp_bearer = unauth_client.get('/api/admin/stats', headers={'Authorization': f'Bearer {token}'})
    assert resp_bearer.status_code == 200, f"Expected 200 with Bearer token, got {resp_bearer.status_code}"
    print("  -> Passed! Administrator access verified via session cookie, X-Admin-Token, and Bearer token.")
    return token

def test_manipulated_order_total():
    print("[SECURITY TEST 4] Testing Client Order Manipulation Protection ...")
    client = app.test_client()

    # Query Product 1 real price from DB
    conn = get_db()
    p1 = conn.execute("SELECT price FROM Products WHERE product_id=1").fetchone()
    real_unit_price = float(p1['price'])
    conn.close()

    qty = 3
    expected_authoritative_total = round(real_unit_price * qty, 2)

    # Client maliciously attempts to pass price: 1.0 and total_amount: 3.0
    malicious_payload = {
        "user_id": 1,
        "vendor_id": 1,
        "items": [{"product_id": 1, "quantity": qty, "price": 1.0}],
        "total_amount": 3.0,
        "notes": "Testing order total recalculation"
    }
    resp = client.post('/api/orders', json=malicious_payload)
    assert resp.status_code == 200
    res = resp.get_json()
    assert res.get('success') is True
    order_id = res.get('order_id')
    assert res.get('total_amount') == expected_authoritative_total, f"Expected {expected_authoritative_total}, got {res.get('total_amount')}"

    # Verify database record
    conn = get_db()
    saved_order = conn.execute("SELECT total_amount FROM Orders WHERE order_id=?", (order_id,)).fetchone()
    assert saved_order['total_amount'] == expected_authoritative_total, f"Saved total {saved_order['total_amount']} != expected {expected_authoritative_total}"
    conn.close()
    print(f"  -> Passed! Client total of Rs.3.0 was overwritten by authoritative server total Rs.{expected_authoritative_total}.")

def test_out_of_stock_order_rejection():
    print("[SECURITY TEST 5] Testing Out-of-Stock Product Order Rejection ...")
    client = app.test_client()

    conn = get_db()
    conn.execute("UPDATE Products SET availability=0 WHERE product_id=1")
    conn.commit()
    conn.close()

    try:
        resp = client.post('/api/orders', json={
            "user_id": 1,
            "vendor_id": 1,
            "items": [{"product_id": 1, "quantity": 1}],
            "total_amount": 140
        })
        assert resp.status_code == 400, f"Expected 400 Bad Request for out of stock, got {resp.status_code}"
        res = resp.get_json()
        assert res.get('success') is False
        assert "out of stock" in res.get('error', '').lower()
        print("  -> Passed! Attempting to purchase an out-of-stock product was correctly rejected with 400.")
    finally:
        conn = get_db()
        conn.execute("UPDATE Products SET availability=1 WHERE product_id=1")
        conn.commit()
        conn.close()

def test_invalid_order_inputs():
    print("[SECURITY TEST 6] Testing Invalid Order Inputs (Zero Quantity, Empty Items, Missing Vendor) ...")
    client = app.test_client()

    # 1. Empty items
    r1 = client.post('/api/orders', json={"user_id": 1, "vendor_id": 1, "items": []})
    assert r1.status_code == 400, f"Expected 400 for empty items, got {r1.status_code}"

    # 2. Zero quantity
    r2 = client.post('/api/orders', json={"user_id": 1, "vendor_id": 1, "items": [{"product_id": 1, "quantity": 0}]})
    assert r2.status_code == 400, f"Expected 400 for 0 quantity, got {r2.status_code}"

    # 3. Non-existent product
    r3 = client.post('/api/orders', json={"user_id": 1, "vendor_id": 1, "items": [{"product_id": 99999, "quantity": 1}]})
    assert r3.status_code == 400, f"Expected 400 for non-existent product, got {r3.status_code}"

    # 4. Wrong vendor product
    r4 = client.post('/api/orders', json={"user_id": 1, "vendor_id": 2, "items": [{"product_id": 1, "quantity": 1}]})
    assert r4.status_code == 400, f"Expected 400 for vendor mismatch, got {r4.status_code}"
    print("  -> Passed! Invalid order inputs correctly rejected with 400 Bad Request.")

def test_order_status_transitions():
    print("[SECURITY TEST 7] Testing Order Status Transitions & Non-Existent Order Checks ...")
    client = app.test_client()

    # Invalid status string
    r1 = client.patch('/api/orders/1/status', json={"status": "invalid_status_xyz"})
    assert r1.status_code == 400, f"Expected 400 for invalid status, got {r1.status_code}"

    # Non-existent order ID
    r2 = client.patch('/api/orders/99999/status', json={"status": "ready"})
    assert r2.status_code == 404, f"Expected 404 for non-existent order, got {r2.status_code}"

    # Valid status
    r3 = client.patch('/api/orders/1/status', json={"status": "confirmed"})
    assert r3.status_code == 200
    assert r3.get_json().get("status") == "confirmed"
    print("  -> Passed! Order status transitions strictly validated.")

def test_favicon_and_pwa_assets():
    print("[SECURITY TEST 8] Testing /favicon.ico and PWA Assets ...")
    client = app.test_client()

    # Favicon
    fav_resp = client.get('/favicon.ico')
    assert fav_resp.status_code == 200, f"Expected 200 for /favicon.ico, got {fav_resp.status_code}"
    assert 'image' in fav_resp.content_type, f"Expected image content-type, got {fav_resp.content_type}"
    print("  -> /favicon.ico returns HTTP 200 with image content.")

    # Service Worker verification
    with open(os.path.join('static', 'sw.js'), 'r', encoding='utf-8') as f:
        sw_text = f.read()
    assert "req.method !== 'GET'" in sw_text, "Non-GET bypass missing in sw.js"
    assert "url.pathname.startsWith('/api/')" in sw_text, "/api/ bypass missing in sw.js"
    assert "navigate" in sw_text, "Navigation network-first missing in sw.js"
    print("  -> static/sw.js correctly bypasses cache for non-GET and /api/, and uses network-first for HTML.")

    # Manifest verification
    with open(os.path.join('static', 'manifest.json'), 'r', encoding='utf-8') as f:
        manifest_text = f.read()
    assert "#e11d48" in manifest_text, "Theme color #e11d48 missing in manifest.json"
    print("  -> static/manifest.json brand color #e11d48 verified.")

def test_progressive_password_migration():
    print("[SECURITY TEST 9] Testing Progressive Password Migration to Werkzeug Salted Hash ...")
    client = app.test_client()

    conn = get_db()
    import hashlib
    legacy_hash = hashlib.sha256(b"password123").hexdigest()
    conn.execute("UPDATE Users SET password_hash = ? WHERE user_id=2", (legacy_hash,))
    conn.commit()
    old_hash = legacy_hash
    conn.close()

    # Login as User 2 (priya@locallift.com / password123)
    resp = client.post('/api/auth/login', json={"email": "priya@locallift.com", "password": "password123"})
    assert resp.status_code == 200

    conn = get_db()
    u2_new = conn.execute("SELECT password_hash FROM Users WHERE user_id=2").fetchone()
    new_hash = u2_new['password_hash']
    conn.close()

    assert new_hash.startswith('scrypt:') or new_hash.startswith('pbkdf2:'), f"Hash not upgraded: {new_hash}"
    assert new_hash != old_hash, "Hash was not re-salted"
    print("  -> Passed! User logged in with legacy password; hash was transparently upgraded to salted Werkzeug hash.")

def test_db_path_and_persistence_logic():
    print("[SECURITY TEST 10] Testing DATABASE_PATH Resolution & Directory Creation ...")
    nested_dir = os.path.abspath(os.path.join('temp_test_dir', 'subdir', 'nested.sqlite'))
    os.environ['DATABASE_PATH'] = nested_dir
    resolved = get_db_path()
    assert resolved == nested_dir
    assert os.path.exists(os.path.dirname(nested_dir)), "Parent directory was not auto-created"
    
    # Cleanup test dir
    os.environ['DATABASE_PATH'] = TEST_DB
    shutil.rmtree(os.path.abspath('temp_test_dir'), ignore_errors=True)
    print("  -> Passed! DATABASE_PATH auto-creates missing parent directories.")

if __name__ == "__main__":
    try:
        test_unauthenticated_admin_access()
        test_non_admin_forbidden_access()
        token = test_authorized_admin_access()
        test_manipulated_order_total()
        test_out_of_stock_order_rejection()
        test_invalid_order_inputs()
        test_order_status_transitions()
        test_favicon_and_pwa_assets()
        test_progressive_password_migration()
        test_db_path_and_persistence_logic()
        print("\n[ALL PRODUCTION SECURITY TESTS PASSED 10/10] Platform is hardened and ready!")
    finally:
        gc.collect()
        if os.path.exists(TEST_DB):
            try:
                os.remove(TEST_DB)
                print(f"[CLEANUP] Successfully cleaned up temporary test database {TEST_DB}")
            except Exception as e:
                print(f"[CLEANUP NOTE] {e}")
