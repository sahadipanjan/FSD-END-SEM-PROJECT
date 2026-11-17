-- =====================================================
-- CAMPUS LOST AND FOUND PORTAL
-- Seed Data for MySQL 8 and H2
-- =====================================================

-- 1. Categories
INSERT INTO categories (id, name, description) VALUES
(1, 'Electronics', 'Laptops, mobile phones, chargers, headphones, calculators, USB drives'),
(2, 'ID & Cards', 'Student ID cards, library cards, national IDs, credit/debit cards'),
(3, 'Wallets & Purses', 'Leather wallets, coin pouches, cardholders, money clips'),
(4, 'Bags & Backpacks', 'Backpacks, shoulder bags, duffel bags, laptop sleeves'),
(5, 'Keys', 'Room keys, bike/car keys, keychains with access tags'),
(6, 'Books & Stationery', 'Textbooks, notebooks, pencil pouches, calculators, lab manuals'),
(7, 'Clothing & Apparel', 'Jackets, hoodies, caps, umbrellas, scarves, lab coats'),
(8, 'Others', 'Water bottles, spectacles, sports gear, musical instruments');

-- 2. Locations
INSERT INTO locations (id, name, description) VALUES
(1, 'Main Library', 'Central university library reading halls and circulation desk'),
(2, 'Main Gate', 'Primary campus security gate and visitor entry checkpoint'),
(3, 'Student Canteen', 'Central cafeteria dining hall and juice corner'),
(4, 'Hostel Block A', 'Residential hostel lobby, mess, and common rooms'),
(5, 'Admin Block', 'Registrar office, finance counter, and dean offices'),
(6, 'Sports Complex', 'Indoor badminton courts, gym, and outdoor stadium track'),
(7, 'CS Department', 'Turing Hall, lab 301, and faculty lounge on 3rd floor'),
(8, 'Auditorium', 'Main university auditorium and seminar hall lobby'),
(9, 'West Parking Lot', 'Two-wheeler and four-wheeler vehicle parking area'),
(10, 'Campus Bus Stop', 'Shuttle transit pick-up and drop-off point near north gate');

-- 3. Default Admin (Password: AdminPassword123!)
INSERT INTO admins (id, full_name, email, password_hash, created_at, updated_at) VALUES
(1, 'Campus Desk Admin', 'admin@campus.edu', '$2a$10$eOdT0naxgB7g27zDPZC42.tf6FuCnIjMHGeWCtQZSsmxnPdrCPwVC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Demo Users (Password: UserPassword123!)
INSERT INTO users (id, full_name, email, password_hash, department, phone, is_blocked, created_at, updated_at) VALUES
(1, 'Alice Smith', 'alice@campus.edu', '$2a$10$kypjH8h32BdBCuR9y.ZdXOC9qxmngtrMXCMCqgi1L1UfB4l/tPScu', 'Computer Science', '+1-555-0101', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Bob Johnson', 'bob@campus.edu', '$2a$10$kypjH8h32BdBCuR9y.ZdXOC9qxmngtrMXCMCqgi1L1UfB4l/tPScu', 'Mechanical Engineering', '+1-555-0102', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Charlie Davis', 'charlie@campus.edu', '$2a$10$kypjH8h32BdBCuR9y.ZdXOC9qxmngtrMXCMCqgi1L1UfB4l/tPScu', 'Electrical Engineering', '+1-555-0103', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5. Realistic Items (12 items with mixed types and statuses)
INSERT INTO items (id, type, title, description, category_id, location_id, event_date, image_path, contact_preference, status, reported_by_user_id, removal_reason, created_at, updated_at) VALUES
-- Item 1: LOST - OPEN
(1, 'LOST', 'Blue HydroFlask Water Bottle', 'Matte blue HydroFlask 32oz with a NASA sticker and dent on bottom rim. Left on table 4.', 8, 1, '2026-11-12', NULL, 'Campus Desk', 'OPEN', 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Item 2: FOUND - OPEN (matches Item 1 in suggestion logic!)
(2, 'FOUND', 'Navy Blue Insulated Water Flask', 'Found a blue insulated metal water flask with science stickers near the study cubicles.', 8, 1, '2026-11-13', NULL, 'Campus Desk', 'OPEN', 2, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Item 3: LOST - OPEN
(3, 'LOST', 'Lenovo ThinkPad Laptop Charger', '65W USB-C black charger with velcro cable tie. Forgotten during CS301 lab session.', 1, 7, '2026-11-14', NULL, 'Email', 'OPEN', 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Item 4: FOUND - OPEN (matches Item 3 in suggestion logic!)
(4, 'FOUND', 'Black 65W USB-C Power Adapter', 'Found Lenovo 65W power brick under workstation desk 12 in CS Turing Lab.', 1, 7, '2026-11-14', NULL, 'Campus Desk', 'OPEN', 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Item 5: LOST - RESOLVED
(5, 'LOST', 'Brown Leather Fossil Wallet', 'Contains student ID card for Alice Smith and transit card. Lost near canteen.', 3, 3, '2026-11-08', NULL, 'Campus Desk', 'RESOLVED', 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Item 6: FOUND - RESOLVED (resolved alongside item 5)
(6, 'FOUND', 'Fossil Men Leather Wallet', 'Found near the coffee counter in student cafeteria with several cards inside.', 3, 3, '2026-11-08', NULL, 'Campus Desk', 'RESOLVED', 2, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Item 7: LOST - OPEN
(7, 'LOST', 'Sony WH-1000XM4 Noise Cancelling Headphones', 'Silver/grey Sony over-ear headphones inside a black zippered hard travel case.', 1, 1, '2026-11-15', NULL, 'Phone', 'OPEN', 2, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Item 8: FOUND - OPEN
(8, 'FOUND', 'Over-Ear Wireless Headphones in Case', 'Grey wireless headphones found on reading desk in 2nd floor silent section.', 1, 1, '2026-11-16', NULL, 'Campus Desk', 'OPEN', 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Item 9: LOST - OPEN
(9, 'LOST', 'Set of 3 Dorm Keys on Red Lanyard', 'Room 204 keys with a red university athletics lanyard and bottle opener keychain.', 5, 4, '2026-11-16', NULL, 'Email', 'OPEN', 3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Item 10: FOUND - OPEN
(10, 'FOUND', 'Keys with Red Strap', 'Found set of brass keys with red branded strap near hostel mess entrance.', 5, 4, '2026-11-16', NULL, 'Campus Desk', 'OPEN', 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Item 11: LOST - REMOVED
(11, 'LOST', 'Spam Test Report - Broken Pencil', 'Duplicate entry submitted erroneously.', 6, 3, '2026-11-10', NULL, 'Email', 'REMOVED', 2, 'Duplicate entry flagged and removed by desk staff.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Item 12: FOUND - OPEN
(12, 'FOUND', 'Calculus Early Transcendentals Textbook 9th Ed', 'Hardcover Stewart Calculus book left on bench near auditorium exit.', 6, 8, '2026-11-16', NULL, 'Campus Desk', 'OPEN', 2, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 6. Sample Claims
INSERT INTO claims (id, item_id, claimant_user_id, message, status, admin_id, admin_remark, created_at, updated_at) VALUES
-- Claim 1: Resolved claim on Item 6
(1, 6, 1, 'This is my wallet! It contains my Alice Smith CS department student ID and green transit card.', 'APPROVED', 1, 'Verified claimant student ID in person at desk. Handed over.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Claim 2: Pending claim on Item 2
(2, 2, 1, 'I lost my blue HydroFlask at the library yesterday. It has a NASA circle sticker on the side.', 'PENDING', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Claim 3: Pending claim on Item 4
(3, 4, 3, 'This matches my Lenovo charger left at lab 301. It has my initials CD written in silver marker.', 'PENDING', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Claim 4: Rejected claim on Item 8
(4, 8, 1, 'I think these might be my headphones.', 'REJECTED', 1, 'Claimant could not provide serial number or matching color details upon desk verification.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 7. Sample Notifications
INSERT INTO notifications (id, user_id, title, message, is_read, created_at) VALUES
(1, 1, 'Claim Approved!', 'Your claim for item "Fossil Men Leather Wallet" has been approved by the Campus Desk Admin. Please visit the admin desk to collect it.', TRUE, CURRENT_TIMESTAMP),
(2, 1, 'Claim Decision Update', 'Your claim for item "Over-Ear Wireless Headphones in Case" was reviewed and rejected. Remark: Claimant could not provide serial number or matching color details upon desk verification.', FALSE, CURRENT_TIMESTAMP),
(3, 2, 'New Claim Submitted', 'Alice Smith submitted a claim for your found item "Navy Blue Insulated Water Flask". The desk is mediating.', FALSE, CURRENT_TIMESTAMP),
(4, 1, 'New Claim Submitted', 'Charlie Davis submitted a claim for your found item "Black 65W USB-C Power Adapter". The desk is mediating.', FALSE, CURRENT_TIMESTAMP);

-- 8. Sample Audit Logs
INSERT INTO audit_logs (id, admin_id, admin_email, action, target_type, target_id, details, created_at) VALUES
(1, 1, 'admin@campus.edu', 'CLAIM_APPROVED', 'CLAIM', 1, 'Approved claim #1 for item #6 (Fossil Men Leather Wallet). Verified student ID in person.', CURRENT_TIMESTAMP),
(2, 1, 'admin@campus.edu', 'ITEM_RESOLVED', 'ITEM', 6, 'Item #6 marked RESOLVED following approved claim #1.', CURRENT_TIMESTAMP),
(3, 1, 'admin@campus.edu', 'CLAIM_REJECTED', 'CLAIM', 4, 'Rejected claim #4 for item #8. Reason: Failed identity/detail check.', CURRENT_TIMESTAMP),
(4, 1, 'admin@campus.edu', 'ITEM_REMOVED', 'ITEM', 11, 'Soft deleted item #11. Reason: Duplicate entry flagged and removed by desk staff.', CURRENT_TIMESTAMP);
