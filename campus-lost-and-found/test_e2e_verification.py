import os
import urllib.request
import urllib.parse
import json
import mimetypes
import uuid
import sys

BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8080").rstrip("/")

results = []

def record(test_name, passed, message=""):
    results.append((test_name, passed, message))
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {test_name}: {message}")

def make_request(path, method="GET", data=None, token=None, content_type="application/json"):
    url = f"{BASE_URL}{path}"
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = None
    if data is not None:
        if content_type == "application/json":
            body = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"
        elif isinstance(data, bytes):
            body = data
            headers["Content-Type"] = content_type

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            code = resp.getcode()
            raw = resp.read()
            resp_data = None
            if raw:
                try:
                    resp_data = json.loads(raw.decode("utf-8"))
                except:
                    resp_data = raw.decode("utf-8")
            return code, resp_data
    except urllib.error.HTTPError as e:
        raw = e.read()
        err_data = None
        if raw:
            try:
                err_data = json.loads(raw.decode("utf-8"))
            except:
                err_data = raw.decode("utf-8")
        return e.code, err_data

def run_tests():
    print("=== STARTING FULL END-TO-END VERIFICATION ===\n")

    # 1. Public stats and Swagger
    code, stats = make_request("/api/public/stats")
    record("Public Stats API", code == 200 and stats.get("totalItemsReported") >= 12, f"Total items: {stats.get('totalItemsReported')}")

    code, cats = make_request("/api/public/categories")
    record("Public Categories API", code == 200 and len(cats) >= 8, f"Categories count: {len(cats)}")

    code, locs = make_request("/api/public/locations")
    record("Public Locations API", code == 200 and len(locs) >= 10, f"Locations count: {len(locs)}")

    code, _ = make_request("/v3/api-docs")
    record("Swagger / OpenAPI Docs", code == 200, "OpenAPI 3 spec served on /v3/api-docs")

    # 2. User Authentication
    test_user_email = f"student_{uuid.uuid4().hex[:6]}@campus.edu"
    reg_payload = {
        "fullName": "Student Tester",
        "email": test_user_email,
        "password": "TestPassword123!",
        "confirmPassword": "TestPassword123!",
        "department": "Computer Science",
        "phone": "+1-555-9988"
    }
    code, reg_resp = make_request("/api/auth/user/register", method="POST", data=reg_payload)
    user_token = reg_resp.get("token") if code == 201 else None
    record("User Registration", code == 201 and user_token is not None, f"Registered {test_user_email}")

    # Duplicate email rejection
    code, dup_resp = make_request("/api/auth/user/register", method="POST", data=reg_payload)
    record("Duplicate Email Rejection", code == 400, "Rejected duplicate user email")

    # Wrong password rejection
    code, wrong_resp = make_request("/api/auth/user/login", method="POST", data={"email": test_user_email, "password": "WrongPassword!"})
    record("User Login Wrong Password Rejection", code == 401, "Returned 401 Unauthorized")

    # Valid login
    code, login_resp = make_request("/api/auth/user/login", method="POST", data={"email": test_user_email, "password": "TestPassword123!"})
    record("User Login Valid Credentials", code == 200 and login_resp.get("token") is not None, "Login successful")

    # Seed user Alice login
    code, alice_resp = make_request("/api/auth/user/login", method="POST", data={"email": "alice@campus.edu", "password": "UserPassword123!"})
    alice_token = alice_resp.get("token") if code == 200 else None
    record("Seed User Alice Login", code == 200 and alice_token is not None, "Alice logged in successfully")

    # Seed user Bob login
    code, bob_resp = make_request("/api/auth/user/login", method="POST", data={"email": "bob@campus.edu", "password": "UserPassword123!"})
    bob_token = bob_resp.get("token") if code == 200 else None
    record("Seed User Bob Login", code == 200 and bob_token is not None, "Bob logged in successfully")

    # 3. Admin Authentication & Role Separation
    # Admin register with wrong invite code
    code, bad_invite = make_request("/api/auth/admin/register", method="POST", data={
        "fullName": "Fake Admin",
        "email": "fakeadmin@campus.edu",
        "password": "AdminPassword123!",
        "confirmPassword": "AdminPassword123!",
        "inviteCode": "WRONG_CODE"
    })
    record("Admin Register Wrong Invite Code Rejection", code == 400, "Rejected invalid invite code")

    # Seed admin login
    code, admin_resp = make_request("/api/auth/admin/login", method="POST", data={"email": "admin@campus.edu", "password": "AdminPassword123!"})
    admin_token = admin_resp.get("token") if code == 200 else None
    record("Default Admin Login", code == 200 and admin_token is not None, "Admin logged in successfully")

    # User token cannot access Admin endpoint
    code, _ = make_request("/api/admin/dashboard", token=user_token)
    record("Role Separation (User accessing /api/admin/**)", code == 403, f"Returned {code} Forbidden as required")

    # Admin token cannot access User endpoint
    code, _ = make_request("/api/user/dashboard", token=admin_token)
    record("Role Separation (Admin accessing /api/user/**)", code == 403, f"Returned {code} Forbidden as required")

    # Admin register with valid invite code
    new_admin_email = f"officer_{uuid.uuid4().hex[:6]}@campus.edu"
    code, new_admin_resp = make_request("/api/auth/admin/register", method="POST", data={
        "fullName": "New Desk Officer",
        "email": new_admin_email,
        "password": "AdminPassword123!",
        "confirmPassword": "AdminPassword123!",
        "inviteCode": "CAMPUS_ADMIN_2026"
    })
    record("Admin Register Valid Invite Code", code == 201 and new_admin_resp.get("token") is not None, f"Admin {new_admin_email} registered")

    # 4. Report Items (Multipart Form Data)
    boundary = "----WebKitFormBoundary" + uuid.uuid4().hex
    def encode_multipart(fields, files=None):
        lines = []
        for k, v in fields.items():
            lines.append(f"--{boundary}".encode())
            lines.append(f'Content-Disposition: form-data; name="{k}"'.encode())
            lines.append(b"")
            lines.append(str(v).encode())
        if files:
            for k, (filename, content, mime) in files.items():
                lines.append(f"--{boundary}".encode())
                lines.append(f'Content-Disposition: form-data; name="{k}"; filename="{filename}"'.encode())
                lines.append(f"Content-Type: {mime}".encode())
                lines.append(b"")
                lines.append(content)
        lines.append(f"--{boundary}--".encode())
        lines.append(b"")
        return b"\r\n".join(lines)

    # Report Lost Item without image
    lost_item_data = {
        "type": "LOST",
        "title": "Lost Silver Apple MacBook Air",
        "description": "M2 MacBook Air 13 inch in navy blue felt sleeve forgotten in CS lab 301.",
        "categoryId": "1",
        "locationId": "7",
        "eventDate": "2026-11-17",
        "contactPreference": "Campus Desk"
    }
    lost_body = encode_multipart(lost_item_data)
    code, lost_resp = make_request("/api/user/items", method="POST", data=lost_body, token=user_token, content_type=f"multipart/form-data; boundary={boundary}")
    created_lost_id = lost_resp.get("id") if code == 201 else None
    record("Report Lost Item Without Image", code == 201 and created_lost_id is not None, f"Created item #{created_lost_id}")

    # Report Found Item with valid mock PNG image
    tiny_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    found_item_data = {
        "type": "FOUND",
        "title": "Found Silver MacBook Air in Sleeve",
        "description": "Apple laptop in navy felt sleeve handed to front counter by CS cleaning crew.",
        "categoryId": "1",
        "locationId": "7",
        "eventDate": "2026-11-17",
        "contactPreference": "Campus Desk"
    }
    found_body = encode_multipart(found_item_data, files={"image": ("laptop.png", tiny_png, "image/png")})
    code, found_resp = make_request("/api/user/items", method="POST", data=found_body, token=alice_token, content_type=f"multipart/form-data; boundary={boundary}")
    created_found_id = found_resp.get("id") if code == 201 else None
    image_stored = found_resp.get("imagePath") if code == 201 else None
    record("Report Found Item With Image", code == 201 and created_found_id is not None and image_stored is not None, f"Item #{created_found_id}, image stored at {image_stored}")

    # Invalid file extension rejection
    bad_file_body = encode_multipart(found_item_data, files={"image": ("script.exe", b"malicious", "application/octet-stream")})
    code, _ = make_request("/api/user/items", method="POST", data=bad_file_body, token=alice_token, content_type=f"multipart/form-data; boundary={boundary}")
    record("Invalid File Type Rejection", code == 400, "Rejected non-image file upload")

    # 5. Browse, Search, Filters, Pagination
    code, search_resp = make_request("/api/user/items?query=MacBook&type=LOST", token=user_token)
    record("Browse with Query & Type Filter", code == 200 and search_resp.get("totalElements") >= 1, f"Found {search_resp.get('totalElements')} items")

    # 6. Smart Suggestions
    code, sugg_resp = make_request(f"/api/user/items/{created_lost_id}/suggestions", token=user_token)
    record("Smart Suggestions for Lost Item", code == 200 and len(sugg_resp) > 0, f"Returned {len(sugg_resp)} smart suggestions with scores")

    # 7. Claims & Business Rules
    # Business rule: User cannot claim own item
    code, own_claim_resp = make_request(f"/api/user/items/{created_lost_id}/claims", method="POST", data={"message": "I want to claim my own lost report"}, token=user_token)
    record("Business Rule: Cannot Claim Own Item", code == 400, "Rejected claiming own item")

    # User submits claim on Found item (Alice reported item, user claims it)
    code, claim_sub = make_request(f"/api/user/items/{created_found_id}/claims", method="POST", data={"message": "This is my laptop. It has a tiny dent on bottom left corner and student id inside sleeve."}, token=user_token)
    claim_id_1 = claim_sub.get("id") if code == 201 else None
    record("Submit Claim by User", code == 201 and claim_id_1 is not None, f"Submitted claim #{claim_id_1}")

    # Business rule: Cannot submit duplicate pending claim
    code, dup_claim = make_request(f"/api/user/items/{created_found_id}/claims", method="POST", data={"message": "Second duplicate attempt"}, token=user_token)
    record("Business Rule: Duplicate Pending Claim Rejection", code == 400, "Rejected duplicate pending claim")

    # Another user (Bob) submits competing claim on the same found item
    code, claim_sub_bob = make_request(f"/api/user/items/{created_found_id}/claims", method="POST", data={"message": "Competing claim from Bob for testing auto-rejection."}, token=bob_token)
    claim_id_bob = claim_sub_bob.get("id") if code == 201 else None
    record("Submit Competing Claim by Bob", code == 201 and claim_id_bob is not None, f"Submitted claim #{claim_id_bob}")

    # Admin views Claims Queue
    code, q_resp = make_request("/api/admin/claims?status=PENDING", token=admin_token)
    record("Admin Claims Queue List", code == 200 and q_resp.get("totalElements") >= 2, f"Queue contains {q_resp.get('totalElements')} pending claims")

    # Admin approves User's claim -> item becomes RESOLVED, Bob's claim auto-rejected
    code, approve_resp = make_request(f"/api/admin/claims/{claim_id_1}/approve", method="PATCH", data={"remark": "Verified student ID and laptop serial at desk. Released."}, token=admin_token)
    record("Admin Approve Claim Flow", code == 200 and approve_resp.get("status") == "APPROVED", "Claim #1 approved successfully")

    # Check item status is now RESOLVED
    code, verified_item = make_request(f"/api/user/items/{created_found_id}", token=user_token)
    record("Item Status Auto-Resolved", code == 200 and verified_item.get("status") == "RESOLVED", "Item marked RESOLVED")

    # Check competing claim (Bob's claim) was auto-rejected
    code, all_bob_claims = make_request("/api/user/claims/mine", token=bob_token)
    bob_claim_status = next((c.get("status") for c in all_bob_claims.get("content", []) if c.get("id") == claim_id_bob), None)
    record("Competing Claim Auto-Rejected", bob_claim_status == "REJECTED", f"Bob's claim is now {bob_claim_status}")

    # Reject path test on a new claim
    code, dummy_lost = make_request("/api/user/items", method="POST", data=encode_multipart({
        "type": "FOUND",
        "title": "Lost Scarf",
        "description": "Red wool scarf found in auditorium bench.",
        "categoryId": "7",
        "locationId": "8",
        "eventDate": "2026-11-17",
    }), token=alice_token, content_type=f"multipart/form-data; boundary={boundary}")
    dummy_item_id = dummy_lost.get("id")
    code, reject_claim_sub = make_request(f"/api/user/items/{dummy_item_id}/claims", method="POST", data={"message": "Claiming scarf but invalid details."}, token=bob_token)
    reject_claim_id = reject_claim_sub.get("id")

    code, reject_resp = make_request(f"/api/admin/claims/{reject_claim_id}/reject", method="PATCH", data={"remark": "Claimant description did not match physical item."}, token=admin_token)
    record("Admin Reject Claim Flow", code == 200 and reject_resp.get("status") == "REJECTED", "Claim rejected with remark")

    # 8. Notifications
    code, notif_count = make_request("/api/user/notifications/unread-count", token=user_token)
    record("Notifications Unread Count", code == 200 and notif_count.get("unreadCount") is not None, f"Unread count: {notif_count.get('unreadCount')}")

    code, notifs = make_request("/api/user/notifications", token=user_token)
    record("Notifications List", code == 200 and len(notifs.get("content", [])) > 0, f"Retrieved {len(notifs.get('content'))} notifications")

    if notifs.get("content"):
        first_notif_id = notifs["content"][0]["id"]
        code, _ = make_request(f"/api/user/notifications/{first_notif_id}/read", method="PATCH", token=user_token)
        record("Notification Mark Read", code == 200, f"Notification #{first_notif_id} marked as read")

    code, _ = make_request("/api/user/notifications/read-all", method="PATCH", token=user_token)
    record("Notification Mark All Read", code == 200, "All notifications marked read")

    # 9. Admin Moderation (Block, Unblock, Soft-delete, Restore, Categories)
    # Block user Bob
    code, block_resp = make_request(f"/api/admin/users/2/block", method="PATCH", token=admin_token)
    record("Admin Block User", code == 200 and block_resp.get("blocked") is True, "User #2 suspended")

    # Blocked user cannot log in
    code, blocked_login = make_request("/api/auth/user/login", method="POST", data={"email": "bob@campus.edu", "password": "UserPassword123!"})
    record("Blocked User Login Blocked (403)", code == 403, "Blocked user prevented from authenticating")

    # Unblock user Bob
    code, unblock_resp = make_request(f"/api/admin/users/2/unblock", method="PATCH", token=admin_token)
    record("Admin Unblock User", code == 200 and unblock_resp.get("blocked") is False, "User #2 reinstated")

    # Soft delete item with reason
    code, rm_resp = make_request(f"/api/admin/items/{dummy_item_id}/remove", method="PATCH", data={"reason": "Flagged duplicate testing"}, token=admin_token)
    record("Admin Soft Delete Item", code == 200 and rm_resp.get("status") == "REMOVED", "Item removed with reason")

    # Restore item
    code, rest_resp = make_request(f"/api/admin/items/{dummy_item_id}/restore", method="PATCH", token=admin_token)
    record("Admin Restore Item", code == 200 and rest_resp.get("status") == "OPEN", "Item restored to OPEN")

    # Category in use protection
    code, del_cat = make_request("/api/admin/categories/1", method="DELETE", token=admin_token)
    record("Category In-Use Deletion Protection", code == 400, "Cannot delete category in use by items")

    # Create new category and delete it
    code, new_cat = make_request("/api/admin/categories", method="POST", data={"name": "Temporary Test Cat", "description": "Temp"}, token=admin_token)
    temp_cat_id = new_cat.get("id")
    code, del_temp_cat = make_request(f"/api/admin/categories/{temp_cat_id}", method="DELETE", token=admin_token)
    record("Category CRUD Operations", code == 200, "Created and safely deleted unused category")

    # Audit log check
    code, audit_resp = make_request("/api/admin/audit-logs", token=admin_token)
    record("Admin Audit Trail", code == 200 and audit_resp.get("totalElements") > 0, f"Found {audit_resp.get('totalElements')} audit events")

    # 10. Profile and Password Change
    code, prof_resp = make_request("/api/user/profile", token=user_token)
    record("User Profile Fetch", code == 200 and prof_resp.get("fullName") == "Student Tester", "Profile fetched")

    code, update_prof = make_request("/api/user/profile", method="PUT", data={"fullName": "Student Tester Updated", "department": "Data Science", "phone": "+1-555-4433"}, token=user_token)
    record("User Profile Update", code == 200 and update_prof.get("department") == "Data Science", "Profile updated")

    code, change_pass = make_request("/api/user/change-password", method="PUT", data={"currentPassword": "TestPassword123!", "newPassword": "NewPassword123!", "confirmPassword": "NewPassword123!"}, token=user_token)
    record("User Change Password", code == 200, "Password changed successfully")

    code, new_login = make_request("/api/auth/user/login", method="POST", data={"email": test_user_email, "password": "NewPassword123!"})
    record("User Login With New Password", code == 200, "Authenticated with updated password")

    print("\n=== VERIFICATION SUMMARY ===")
    passed_count = sum(1 for _, p, _ in results if p)
    total_count = len(results)
    print(f"Total Tests Executed: {total_count}")
    print(f"Passed: {passed_count}")
    print(f"Failed: {total_count - passed_count}")

    if passed_count == total_count:
        print("\nALL VERIFICATION CRITERIA PASSED (100%)!")
        return 0
    else:
        print("\nSOME TESTS FAILED!")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
