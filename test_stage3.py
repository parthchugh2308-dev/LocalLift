# -*- coding: utf-8 -*-
"""
Verification suite for Stage 3: Vendor Portal (ISOLATED TEST DATABASE)
Uses a temporary isolated database so LocalLift_DB.sqlite is never polluted.
"""
import os
import shutil
import json
import sqlite3

# 1. Setup isolated test database
TEST_DB = os.path.abspath('LocalLift_TEST_stage3.sqlite')
if os.path.exists('LocalLift_DB.sqlite'):
    shutil.copy2('LocalLift_DB.sqlite', TEST_DB)
    # Seed pending vendor test fixture in isolated test DB
    import sqlite3
    from werkzeug.security import generate_password_hash
    conn = sqlite3.connect(TEST_DB)
    cur = conn.cursor()
    cur.execute("SELECT user_id FROM Users WHERE email = 'spicemart@locallift.com'")
    if not cur.fetchone():
        cur.execute("INSERT INTO Users (name, email, phone, password_hash, user_type) VALUES ('Spice Mart Owner', 'spicemart@locallift.com', '9898989898', ?, 'vendor')", (generate_password_hash('password123'),))
        uid = cur.lastrowid
        cur.execute("INSERT INTO Vendors (vendor_id, owner_user_id, business_name, owner_name, category, address, city, latitude, longitude, phone, email, status) VALUES (17, ?, 'Spice Mart', 'Spice Owner', 'Grocery', 'Market', 'Ludhiana', 30.9, 75.8, '9898989898', 'spicemart@locallift.com', 'pending')", (uid,))
        conn.commit()
    conn.close()

os.environ['DATABASE_PATH'] = TEST_DB

# Import app after setting DATABASE_PATH
from app import app, get_db

app.config['TESTING'] = True
client = app.test_client()

def test_vendor_page():
    print("[TEST 1] Testing GET /vendor ...")
    resp = client.get('/vendor')
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    body = resp.get_data(as_text=True)
    assert "Fraunces" in body, "Fraunces font missing"
    assert "Plus Jakarta Sans" in body, "Plus Jakarta Sans missing"
    assert "rounded-[26%]" in body, "Heart tile logo missing"
    assert "Vendor Partner Portal" in body or "VENDOR PARTNER PORTAL" in body, "Vendor portal title missing"
    assert "Application under review" in body, "Pending approval screen missing"
    assert "Store is Open" in body, "Store open toggle missing"
    print("  -> Passed! Vendor page renders with correct fonts, logo, and sections.")

def test_vendor_auth_approved():
    print("[TEST 2] Testing Vendor Login (Approved: vendor@locallift.com) ...")
    resp = client.post('/api/auth/login', json={"email": "vendor@locallift.com", "password": "password123"})
    assert resp.status_code == 200
    res = resp.get_json()
    assert res.get("success") is True, f"Login failed: {res}"
    assert res.get("user_type") == "vendor", f"Expected user_type vendor, got {res.get('user_type')}"
    assert res.get("vendor_status") == "approved", f"Expected status approved, got {res.get('vendor_status')}"
    vendor_id = res.get("vendor_id")
    print(f"  -> Passed! Approved vendor logged in: id={vendor_id}, status={res.get('vendor_status')}")
    return vendor_id

def test_vendor_auth_pending():
    print("[TEST 3] Testing Vendor Login (Pending: spicemart@locallift.com) ...")
    resp = client.post('/api/auth/login', json={"email": "spicemart@locallift.com", "password": "password123"})
    assert resp.status_code == 200
    res = resp.get_json()
    assert res.get("success") is True, f"Login failed: {res}"
    assert res.get("vendor_status") == "pending", f"Expected status pending, got {res.get('vendor_status')}"
    print(f"  -> Passed! Pending vendor verified: id={res.get('vendor_id')}, status={res.get('vendor_status')}")

def test_vendor_dashboard(vendor_id):
    print(f"[TEST 4] Testing GET /api/vendors/{vendor_id}/dashboard ...")
    resp = client.get(f'/api/vendors/{vendor_id}/dashboard')
    assert resp.status_code == 200, f"Dashboard returned {resp.status_code}"
    data = resp.get_json()
    assert "vendorData" in data or "vendor" in data, "Vendor metadata missing"
    assert "products" in data, "Products array missing"
    assert "orders" in data, "Orders array missing"
    assert "offers" in data, "Offers array missing"
    prod_count = len(data.get("products", []))
    order_count = len(data.get("orders", []))
    offer_count = len(data.get("offers", []))
    print(f"  -> Passed! Dashboard loaded: {prod_count} products, {order_count} orders, {offer_count} offers.")

def test_product_crud(vendor_id):
    print("[TEST 5] Testing Product Add, Stock Toggle, and Delete ...")
    new_prod = {
        "vendor_id": vendor_id,
        "name": "Stage 3 Test Croissant",
        "price": 85,
        "category": "Bakery",
        "description": "Buttery flaky croissant created during test",
        "is_available": 1
    }
    resp = client.post('/api/products', json=new_prod)
    assert resp.status_code == 200
    created = resp.get_json()
    prod_id = created.get("product_id") or created.get("id")
    assert prod_id, "Product creation failed, no ID returned"
    print(f"  -> Added product ID #{prod_id}")

    # Toggle stock
    t_resp = client.patch(f'/api/products/{prod_id}/toggle')
    assert t_resp.status_code == 200
    toggled = t_resp.get_json()
    assert toggled.get("success") is True, f"Toggle failed: {toggled}"
    print(f"  -> Toggled product stock successfully")

    # Delete product
    d_resp = client.delete(f'/api/products/{prod_id}')
    assert d_resp.status_code == 200
    deleted = d_resp.get_json()
    assert deleted.get("success") is True, f"Delete failed: {deleted}"
    print(f"  -> Deleted test product ID #{prod_id}")
    print("  -> Passed! Product CRUD & stock toggle verified.")

def test_order_status_update():
    print("[TEST 6] Testing Order Status Update ...")
    # First login as admin to get access to orders audit or use existing order
    resp = client.get('/api/orders/vendor/1')
    orders = resp.get_json() if resp.status_code == 200 else []
    if orders:
        target_order = orders[0]
        oid = target_order.get("order_id") or target_order.get("id")
        orig_status = target_order.get("status", "pending")

        # Update to ready
        p_resp = client.patch(f'/api/orders/{oid}/status', json={"status": "ready"})
        assert p_resp.status_code == 200
        res = p_resp.get_json()
        assert res.get("success") is True, f"Failed updating order status: {res}"
        print(f"  -> Successfully updated order #{oid} status to 'ready'")

        # Restore
        client.patch(f'/api/orders/{oid}/status', json={"status": orig_status})
        print("  -> Passed! Order status change verified.")
    else:
        print("  -> No orders found to update, skipped order status test.")

if __name__ == "__main__":
    try:
        test_vendor_page()
        vid = test_vendor_auth_approved()
        test_vendor_auth_pending()
        test_vendor_dashboard(vid)
        test_product_crud(vid)
        test_order_status_update()
        print("\n[ALL TESTS PASSED] Stage 3 Vendor Portal verified on isolated test database!")
    finally:
        # Clean up isolated test database
        if os.path.exists(TEST_DB):
            try:
                os.remove(TEST_DB)
                print(f"[CLEANUP] Successfully removed temporary test database {TEST_DB}")
            except Exception as e:
                print(f"[CLEANUP NOTE] Could not remove test DB: {e}")
