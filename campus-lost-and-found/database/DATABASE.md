# Campus Lost and Found Portal - Database Documentation

## Overview
The Campus Lost and Found database is designed for relational consistency, data integrity, and strict separation between regular campus users (students, staff, faculty) and system administrators. It supports MySQL 8 in production and Docker, and an in-memory/file-based H2 profile for zero-install development and testing.

---

## Tables and Data Dictionary

### 1. `users`
Stores student, staff, and faculty accounts. Completely isolated from administrators.
- **`id`** (`BIGINT`, PK, Auto-increment): Unique identifier.
- **`full_name`** (`VARCHAR(100)`, NOT NULL): Full name of the user.
- **`email`** (`VARCHAR(150)`, NOT NULL, UNIQUE): Institutional email address for authentication and contact.
- **`password_hash`** (`VARCHAR(255)`, NOT NULL): BCrypt encrypted password hash (cost factor 10).
- **`department`** (`VARCHAR(100)`, NOT NULL): Academic or operational department (e.g., Computer Science, Mechanical).
- **`phone`** (`VARCHAR(30)`, NULL): Optional contact phone number.
- **`is_blocked`** (`BOOLEAN`, DEFAULT FALSE): Administrative suspension flag. Blocked users cannot authenticate.
- **`created_at`** (`TIMESTAMP`, DEFAULT CURRENT_TIMESTAMP): Account registration timestamp.
- **`updated_at`** (`TIMESTAMP`, DEFAULT CURRENT_TIMESTAMP): Account last modified timestamp.

### 2. `admins`
Stores administrative desk staff accounts. Completely separate table from `users` to guarantee zero role leakage and independent credential management.
- **`id`** (`BIGINT`, PK, Auto-increment): Unique administrator identifier.
- **`full_name`** (`VARCHAR(100)`, NOT NULL): Staff name.
- **`email`** (`VARCHAR(150)`, NOT NULL, UNIQUE): Administrative email address.
- **`password_hash`** (`VARCHAR(255)`, NOT NULL): BCrypt encrypted password hash.
- **`created_at`** (`TIMESTAMP`, DEFAULT CURRENT_TIMESTAMP): Creation timestamp.
- **`updated_at`** (`TIMESTAMP`, DEFAULT CURRENT_TIMESTAMP): Last modified timestamp.

### 3. `categories`
Lookup table defining standard item classifications (e.g., Electronics, ID/Cards, Wallets).
- **`id`** (`BIGINT`, PK, Auto-increment): Unique category identifier.
- **`name`** (`VARCHAR(80)`, NOT NULL, UNIQUE): Category title.
- **`description`** (`VARCHAR(255)`, NULL): Optional contextual description.
- **`created_at`** (`TIMESTAMP`, DEFAULT CURRENT_TIMESTAMP): Record creation timestamp.

### 4. `locations`
Lookup table defining recognized campus landmarks and buildings (e.g., Main Library, Student Center, Sports Complex).
- **`id`** (`BIGINT`, PK, Auto-increment): Unique location identifier.
- **`name`** (`VARCHAR(100)`, NOT NULL, UNIQUE): Location name.
- **`description`** (`VARCHAR(255)`, NULL): Optional zone or building note.
- **`created_at`** (`TIMESTAMP`, DEFAULT CURRENT_TIMESTAMP): Record creation timestamp.

### 5. `items`
Main registry of lost and found item reports.
- **`id`** (`BIGINT`, PK, Auto-increment): Unique report identifier.
- **`type`** (`VARCHAR(10)`, NOT NULL): `LOST` or `FOUND`.
- **`title`** (`VARCHAR(150)`, NOT NULL): Short summary of the item.
- **`description`** (`TEXT`, NOT NULL): Full item details, distinct identifiers, marks.
- **`category_id`** (`BIGINT`, NOT NULL, FK -> `categories.id`): Associated category.
- **`location_id`** (`BIGINT`, NOT NULL, FK -> `locations.id`): Associated campus location.
- **`event_date`** (`DATE`, NOT NULL): Calendar date the item was lost or found.
- **`image_path`** (`VARCHAR(255)`, NULL): Relative path to uploaded photo on server storage (`uploads/`).
- **`contact_preference`** (`VARCHAR(100)`, NULL): Preferred mode of contact (e.g., "Campus Desk", "Email", "Phone").
- **`status`** (`VARCHAR(20)`, DEFAULT 'OPEN'): Lifecycle status (`OPEN`, `RESOLVED`, `REMOVED`).
- **`reported_by_user_id`** (`BIGINT`, NOT NULL, FK -> `users.id`): Submitting user ID.
- **`removal_reason`** (`VARCHAR(255)`, NULL): Administrative explanation if soft-deleted.
- **`created_at`** (`TIMESTAMP`, DEFAULT CURRENT_TIMESTAMP): Report timestamp.
- **`updated_at`** (`TIMESTAMP`, DEFAULT CURRENT_TIMESTAMP): Last modified timestamp.

### 6. `claims`
Records of item ownership assertions submitted by campus members and reviewed by desk staff.
- **`id`** (`BIGINT`, PK, Auto-increment): Unique claim identifier.
- **`item_id`** (`BIGINT`, NOT NULL, FK -> `items.id` ON DELETE CASCADE): Target item.
- **`claimant_user_id`** (`BIGINT`, NOT NULL, FK -> `users.id`): Member submitting the claim.
- **`message`** (`TEXT`, NOT NULL): Ownership proof, serial numbers, concealed markings.
- **`status`** (`VARCHAR(20)`, DEFAULT 'PENDING'): Verification state (`PENDING`, `APPROVED`, `REJECTED`).
- **`admin_id`** (`BIGINT`, NULL, FK -> `admins.id`): Administrator who mediated the claim.
- **`admin_remark`** (`VARCHAR(255)`, NULL): Official review feedback or collection instructions.
- **`created_at`** (`TIMESTAMP`, DEFAULT CURRENT_TIMESTAMP): Submission timestamp.
- **`updated_at`** (`TIMESTAMP`, DEFAULT CURRENT_TIMESTAMP): Decision timestamp.

### 7. `notifications`
User-facing alert messages dispatched on claim approvals, rejections, item claims, and administrative actions.
- **`id`** (`BIGINT`, PK, Auto-increment): Unique notification identifier.
- **`user_id`** (`BIGINT`, NOT NULL, FK -> `users.id` ON DELETE CASCADE): Recipient member.
- **`title`** (`VARCHAR(150)`, NOT NULL): Brief alert subject.
- **`message`** (`TEXT`, NOT NULL): Detailed message body.
- **`is_read`** (`BOOLEAN`, DEFAULT FALSE): Acknowledgment flag.
- **`created_at`** (`TIMESTAMP`, DEFAULT CURRENT_TIMESTAMP): Generation timestamp.

### 8. `audit_logs`
Immutable compliance and traceability journal logging all administrative interventions.
- **`id`** (`BIGINT`, PK, Auto-increment): Unique log identifier.
- **`admin_id`** (`BIGINT`, NOT NULL, FK -> `admins.id`): Acting administrator.
- **`admin_email`** (`VARCHAR(150)`, NOT NULL): Email snapshot for convenience and auditing.
- **`action`** (`VARCHAR(100)`, NOT NULL): Event tag (e.g., `USER_BLOCKED`, `CLAIM_APPROVED`, `ITEM_REMOVED`, `CATEGORY_CREATED`).
- **`target_type`** (`VARCHAR(50)`, NOT NULL): Entity domain (`USER`, `ITEM`, `CLAIM`, `CATEGORY`, `LOCATION`).
- **`target_id`** (`BIGINT`, NULL): ID of the affected record.
- **`details`** (`TEXT`, NULL): Detailed payload or contextual reason.
- **`created_at`** (`TIMESTAMP`, DEFAULT CURRENT_TIMESTAMP): Action timestamp.

---

## Integrity Constraints and Indexes
- **Foreign Keys**: Enforced at the engine level with cascades on subordinate child records (`notifications`, `claims` cascade on item deletion). Categories and locations reject deletion when referenced by items.
- **Indexes**:
  - `idx_items_status` on `items(status)`
  - `idx_items_type` on `items(type)`
  - `idx_items_category` on `items(category_id)`
  - `idx_items_location` on `items(location_id)`
  - `idx_items_reporter` on `items(reported_by_user_id)`
  - `idx_items_event_date` on `items(event_date)`
  - `idx_claims_item` on `claims(item_id)`
  - `idx_claims_claimant` on `claims(claimant_user_id)`
  - `idx_claims_status` on `claims(status)`
  - `idx_notifications_user_read` on `notifications(user_id, is_read)`
  - `idx_audit_admin` on `audit_logs(admin_id)`
