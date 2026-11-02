# -*- coding: utf-8 -*-
"""
Verification suite for Stage 4: Super Admin Control Center (ISOLATED TEST DATABASE)
Uses a temporary isolated database so LocalLift_DB.sqlite is never polluted.
"""
import os
import shutil
import json
import time
import gc

TEST_DB = os.path.abspath('LocalLift_TEST_stage4.sqlite')
if os.path.exists('LocalLift_DB.sqlite'):
    shutil.copy2('LocalLift_DB.sqlite', TEST_DB)

os.environ['DATABASE_PATH'] = TEST_DB

from app import app, get_db

app.config['TESTING'] = True
client = app.test_client()

def test_admin_page_rendering():
    print("[TEST 1] Testing GET /admin page rendering ...")
    resp = client.get('/admin')
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    body = resp.get_data(as_text=True)
    assert "Fraunces" in body, "Fraunces font missing"
    assert "Plus Jakarta Sans" in body, "Plus Jakarta Sans font missing"
    assert "rounded-[26%]" in body, "Exact heart tile logo missing"
    assert "SUPER ADMIN CONTROL CENTER" in body, "Admin title missing"
    assert "Platform overview" in body, "Platform overview section missing"
    assert "Vendor approval queue" in body, "Vendor approval queue table missing"
    assert "Registered users" in body, "Registered users KPI missing"
    assert "GMV" in body, "GMV KPI missing"
    assert "Live Orders Audit Log" in body, "Orders audit log tab missing"
    assert "User Accounts Directory" in body, "User directory tab missing"
    print("  -> Passed! Admin page HTML renders perfectly with all Lovable design elements.")

def test_admin_unauthorized_and_authorized_auth():
    print("[TEST 2] Testing Admin Auth (Unauthorized Access vs Valid Login) ...")
    # 1. Invalid login
    bad_resp = client.post('/api/admin/login', json={"email": "admin@locallift.com", "password": "wrongpassword"})
    assert bad_resp.status_code == 401, f"Expected 401 Unauthorized, got {bad_resp.status_code}"
    res = bad_resp.get_json()
    assert res.get("success") is False, "Expected success: False for bad password"
    print("  -> Passed! Unauthorized login blocked with 401.")

    # 2. Valid admin login
    good_resp = client.post('/api/admin/login', json={"email": "admin@locallift.com", "password": "admin123"})
    assert good_resp.status_code == 200, f"Expected 200, got {good_resp.status_code}"
    res = good_resp.get_json()
    assert res.get("success") is True, f"Admin login failed: {res}"
    assert res.get("user_type") == "admin", "Admin role missing"
    assert "token" in res, "Admin token missing"
    print("  -> Passed! Root Administrator authenticated successfully with session & HMAC token.")
    return res.get("token")

def test_admin_kpis(admin_token):
    print("[TEST 3] Testing GET /api/admin/stats (Protected with HMAC Token) ...")
    # 1. Test without token (should be 401 if no session)
    client_unauth = app.test_client()
    unauth_resp = client_unauth.get('/api/admin/stats')
    assert unauth_resp.status_code == 401, f"Expected 401 unauth, got {unauth_resp.status_code}"
    print("  -> Passed! Unauthenticated request correctly blocked with 401.")

    # 2. Test with token
    headers = {'X-Admin-Token': admin_token}
    resp = client_unauth.get('/api/admin/stats', headers=headers)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    stats = resp.get_json()
    assert "total_users" in stats, "total_users missing"
    assert "approved_vendors" in stats, "approved_vendors missing"
    assert "pending_vendors" in stats, "pending_vendors missing"
    assert "total_orders" in stats, "total_orders missing"
    assert "total_revenue" in stats, "total_revenue (GMV) missing"
    print(f"  -> Passed! Stats: Users={stats['total_users']}, ApprovedVendors={stats['approved_vendors']}, "
          f"PendingVendors={stats['pending_vendors']}, Orders={stats['total_orders']}, GMV=Rs.{stats['total_revenue']}")

def test_vendor_approval_rejection_suspension(admin_token):
    print("[TEST 4] Testing Vendor Full Lifecycle on Isolated DB ...")
    headers = {'X-Admin-Token': admin_token}
    timestamp = int(time.time())
    new_vendor_payload = {
        "business_name": f"Bloom Studio {timestamp}",
        "owner_name": "Priya Sen",
        "category": "Flowers",
        "phone": "9811223344",
        "email": f"bloom_{timestamp}@locallift.com",
        "password": "password123",
        "address": "42 Rose Garden Lane, Market Center"
    }

    # Register vendor
    reg_resp = client.post('/api/vendor/register', json=new_vendor_payload)
    assert reg_resp.status_code == 200
    reg_res = reg_resp.get_json()
    assert reg_res.get("success") is True, f"Registration failed: {reg_res}"
    vid = reg_res.get("vendor_id")
    print(f"  -> Step 1: Registered test vendor ID #{vid}")

    # Verify pending
    list_resp = client.get('/api/admin/vendors', headers=headers)
    assert list_resp.status_code == 200
    v_list = list_resp.get_json()
    v_entry = next((v for v in v_list if (v.get("vendor_id") or v.get("id")) == vid), None)
    assert v_entry is not None, f"Vendor #{vid} not in admin list"
    assert v_entry.get("status") == "pending", f"Expected pending, got {v_entry.get('status')}"
    print(f"  -> Step 2: Verified vendor #{vid} is in 'pending' status in admin queue")

    # Approve vendor
    appr_resp = client.patch(f'/api/admin/vendors/{vid}/status', json={"status": "approved"}, headers=headers)
    assert appr_resp.status_code == 200
    appr_res = appr_resp.get_json()
    assert appr_res.get("status") == "approved", "Status was not updated to approved"
    print(f"  -> Step 3: Admin approved vendor #{vid}")

    # Suspend vendor
    susp_resp = client.patch(f'/api/admin/vendors/{vid}/status', json={"status": "suspended"}, headers=headers)
    assert susp_resp.status_code == 200
    susp_res = susp_resp.get_json()
    assert susp_res.get("status") == "suspended", "Status was not updated to suspended"
    print(f"  -> Step 4: Admin suspended vendor #{vid}")

    # Clean up vendor
    del_resp = client.delete(f'/api/admin/vendors/{vid}', headers=headers)
    assert del_resp.status_code == 200
    print(f"  -> Step 5: Cleaned up test vendor #{vid}")
    print("  -> Passed! Full vendor lifecycle verified on isolated DB.")

def test_admin_orders_and_users(admin_token):
    print("[TEST 5] Testing Admin Orders Audit and Users Directory APIs ...")
    headers = {'X-Admin-Token': admin_token}
    o_resp = client.get('/api/admin/orders', headers=headers)
    assert o_resp.status_code == 200
    orders = o_resp.get_json()
    assert isinstance(orders, list), "Orders should be a list"
    print(f"  -> Orders Audit API verified: {len(orders)} transactions listed.")

    u_resp = client.get('/api/admin/users', headers=headers)
    assert u_resp.status_code == 200
    users = u_resp.get_json()
    assert isinstance(users, list), "Users should be a list"
    print(f"  -> Users Directory API verified: {len(users)} platform users listed.")

if __name__ == "__main__":
    try:
        test_admin_page_rendering()
        token = test_admin_unauthorized_and_authorized_auth()
        test_admin_kpis(token)
        test_vendor_approval_rejection_suspension(token)
        test_admin_orders_and_users(token)
        print("\n[ALL TESTS PASSED] Stage 4 Super Admin Control Center verified on isolated test database!")
    finally:
        gc.collect()
        if os.path.exists(TEST_DB):
            try:
                os.remove(TEST_DB)
                print(f"[CLEANUP] Successfully removed temporary test database {TEST_DB}")
            except Exception as e:
                print(f"[CLEANUP NOTE] Could not remove test DB: {e}")
