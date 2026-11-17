# Campus Lost & Found Portal

A complete, full-stack enterprise web portal designed for universities to streamline the reporting, tracking, matching, and mediated recovery of lost and found personal belongings on campus. The system provides two completely isolated portals: a public and student/staff member interface for reporting items and submitting ownership claims, and a dedicated desk administration interface for managing inventory, verifying claimant proofs, and overseeing handover compliance.

> **Project Source Code Location**: The complete project source code is organized under [`campus-lost-and-found/`](campus-lost-and-found/).
> Please refer to [`campus-lost-and-found/README.md`](campus-lost-and-found/README.md) for the full documentation, architecture diagrams, live demo script, and API specifications.

---

## Quick Start (Zero-Install H2 Mode in 3 Commands)

### 1. Start Backend (Terminal 1)
```bash
cd campus-lost-and-found/backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev-h2
```

### 2. Start Frontend (Terminal 2)
```bash
cd campus-lost-and-found/frontend
npm install
npm run dev
```

### 3. Open in Browser
- **Portal**: [http://localhost:5173](http://localhost:5173)
- **API & Swagger**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## Default Credentials

| Portal | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **Desk Admin** | Administrator | `admin@campus.edu` | `AdminPassword123!` |
| **User (Student)** | CS Student | `alice@campus.edu` | `UserPassword123!` |
| **User (Student)** | MechEng Student | `bob@campus.edu` | `UserPassword123!` |
| **User (Student)** | Electrical Student | `charlie@campus.edu` | `UserPassword123!` |

> **Admin Invite Code for Admin Registration**: `CAMPUS_ADMIN_2026`
