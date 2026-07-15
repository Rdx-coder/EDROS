# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-MGR-001
## VERSION: 1.0.0
## CLASSIFICATION: INTERNAL ONLY (LEVEL 2 - OPERATIONAL STAFF)

---

# DOCUMENT 1: SUPER ADMIN OPERATIONS MANUAL

```
================================================================================
              S U P E R   A D M I N I S T R A T O R   P L A T F O R M
                           O P E R A T I O N S   M A N U A L
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       IT Director
Reviewer:     Chief Architect
Approver:     Chief Technology Officer & Operations Control Board
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline issue of the Super Admin Operations Manual for EDROS v1.0.0. | IT Director | CTO |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [SYSTEM OVERVIEW](#2-system-overview)
3. [SUPER ADMIN DASHBOARD MODULE](#3-super-admin-dashboard-module)
4. [COMPANY & TENANT SETUP CONFIGURATION](#4-company--tenant-setup-configuration)
5. [BANK & CREDITOR INTEGRATION](#5-bank--creditor-integration)
6. [BRANCH SETUP & GEOGRAPHIC REGISTRY](#6-branch-setup--geographic-registry)
7. [USER, ROLE & PERMISSION MANAGEMENT](#7-user-role--permission-management)
8. [EMPLOYEE DIRECTORY & FIELD FORCE ONBOARDING](#8-employee-directory--field-force-onboarding)
9. [RECOVERY CASE ASSIGNMENT & DISPERSION ENGINE](#9-recovery-case-assignment--dispersion-engine)
10. [TARGET MANAGEMENT & COMMISSION INCENTIVES](#10-target-management--commission-incentives)
11. [SYSTEM AUDIT TRAILS & ACTIVITY LOGS](#11-system-audit-trails--activity-logs)
12. [REPORTS, ANALYTICS & REVENUE FORECASTS](#12-reports-analytics--revenue-forecasts)
13. [INFRASTRUCTURE MONITORING & HEALTH CHECKS](#13-infrastructure-monitoring--health-checks)
14. [SYSTEM SETTINGS & ENVIRONMENT POLICIES](#14-system-settings--environment-policies)
15. [BACKUP, RESTORE & DISASTER RECOVERY ACTIONS](#15-backup-restore--disaster-recovery-actions)
16. [DAILY, WEEKLY, AND MONTHLY OPERATIONS CHECKLISTS](#16-daily-weekly-and-monthly-operations-checklists)
17. [BEST PRACTICES & SECURITY SAFEGUARDS](#17-best-practices--security-safeguards)
18. [COMMON MISTAKES & OPERATIONAL PITFALLS](#18-common-mistakes--operational-pitfalls)
19. [TROUBLESHOOTING & EMERGENCY PLAYBOOK](#19-troubleshooting--emergency-playbook)
20. [VALIDATION CHECKLIST & SYSTEM SMOKE TESTING](#20-validation-checklist--system-smoke-testing)
21. [FAQ SECTION](#21-faq-section)
22. [GLOSSARY & REFERENCES](#22-glossary--references)
23. [APPENDIX](#23-appendix)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
This operations manual establishes the definitive procedural framework for the administration, configuration, and maintenance of the Enterprise Debt Recovery Operating System (EDROS) from the Super Administrator control level. This document provides step-by-step instructions to ensure system stability, operational security, regulatory compliance, and consistent core banking tenant management.

### 1.2 Scope
This manual governs all administrative functions exposed within the `Super Admin Portal` of EDROS, including:
* **Tenant provisioning:** Initializing corporate legal entities, creditor bank profiles, and physical branch networks.
* **Identity governance:** Configuring granular Role-Based Access Control (RBAC) permission matrices, single sign-on parameters, and password rotators.
* **Operational configuration:** Running target dispatchers, manual and automated case dispersion algorithms, and legal notice templates.
* **Systems management:** Monitoring platform logs, coordinating automated and manual backups, and reviewing audit ledgers for compliance checks.

### 1.3 Target Audience
This manual is written for:
* **Lead System Administrators** and IT Support Directors managing the daily performance of the EDROS platform.
* **Executive Managers** at Sanjay Dangi Associates reviewing platform-wide tenant allocations and target metrics.
* **Information Security (InfoSec) Officers** auditing operational security controls, data protection gates, and trace pathways.
* **Compliance Auditors** verifying system alignments against Digital Personal Data Protection (DPDP) Act rules and Reserve Bank of India (RBI) guidelines.

---

## 2. SYSTEM OVERVIEW

The Super Admin Portal is the central management engine of the EDROS platform. Operating as a multi-tenant operational layer, it grants administrative control over the entire debt recovery ecosystem, connecting financial creditors with field recovery networks and legal departments.

### 2.1 Navigation & Control Hierarchy
The Super Admin Portal organizes management operations across a modular hierarchy. Every functional domain is isolated to prevent configuration conflicts:

```
[ Super Admin Control Panel ]
             │
             ├──► [ Organization & Tenant Config ] (Company, Banks, Physical Branches)
             │
             ├──► [ Identity & Access Governance ] (Users, Custom RBAC, Field Profiles)
             │
             ├──► [ Operational Control Desk ] (Case Ingestion, Target Metrics, Approvals)
             │
             └──► [ Security, Logs & Diagnostics ] (Audit Trails, Backup Engines, Metrics)
```

---

## 3. SUPER ADMIN DASHBOARD MODULE

The primary screen of the Super Admin Portal provides a real-time overview of system health, active user sessions, campaign performance, and transaction flows.

### 3.1 Real-Time UI Metric Counters
* **Active Connections:** Real-time counts of active operator sessions, database connections, and active mobile executives syncs.
* **API Ingress Latency:** Average latency tracker for edge-routed API calls (target: `< 150ms`).
* **Active Queues:** Displays the current volume of background tasks waiting, active, or failing inside Upstash Redis and BullMQ.
* **Platform Revenue Allocation:** Total collections recorded across all branches during the active calendar month.

### 3.2 Dynamic Visualizers
* **System Load Chart:** A dynamic time-series line graph illustrating CPU, memory, and connection usage across Vercel compute nodes and Railway containers.
* **Regional Activity Map:** A geographical map displaying real-time field check-ins and collection reports based on mobile GPS telemetry data.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: Main Admin Dashboard Overview                |
| Capture the entire screen, focusing on the real-time system metric cards,  |
| the system load chart, and the interactive regional activity map.          |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 4. COMPANY & TENANT SETUP CONFIGURATION

To operate the EDROS platform, administrators must first configure the parent corporate entity (Sanjay Dangi Associates) and configure corporate parameters.

### 4.1 Provisioning the Corporate Entity
1. Navigate to **System Settings** -> **Company Configuration** -> **Add Parent Profile**.
2. Input the legal corporate name: `Sanjay Dangi Associates`.
3. Provide the official Corporate Identification Number (CIN) and tax registration identifiers (GSTIN/PAN).
4. Provide the registered office address and verified contact email domain rules (e.g. `@sanjaydangi.com`).
5. Upload the authorized corporate watermarks and brand signatures to the secure storage bucket.
6. Click **Initialize Tenant**. The system will generate a unique hash ID (`TENANT_SDA_001`) to map child branches, staff records, and database rows.

---

## 5. BANK & CREDITOR INTEGRATION

EDROS supports multi-tenant bank and creditor integrations. Each bank is set up as a distinct, isolated client portfolio with its own case files, interest rates, and settlement limits.

### 5.1 Step-by-Step Bank Onboarding
1. Navigate to **Client Portals** -> **Creditor Management** -> **Onboard New Bank**.
2. Complete the onboarding registration fields:

| Field Label | Parameter Type | Valid Example | Purpose |
| :--- | :---: | :--- | :--- |
| **Creditor Legal Name** | String | State Bank of India | The official name used on generated demand notices. |
| **Bank Code Identifier**| String (Uppercase) | `SBI_CORP_001` | Unique key mapping cases to database storage files. |
| **Integration Protocol**| Select Menu | REST API (Secure JWT) | The data ingestion route used for case uploads. |
| **Settlement Threshold**| Decimal Percentage| 25.00 | Maximum settlement haircut agents can propose without approval. |

3. Click **Generate Integration Key**. The platform generates a unique `API_CLIENT_ID` and a encrypted `API_CLIENT_SECRET`.
4. Document the client keys and securely transmit them to the bank's technical integration team.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: Bank Creditor Setup Panel                    |
| Capture the form UI with completed bank metadata fields, highlighting the   |
| generated API Client ID and Secret key fields.                             |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 6. BRANCH SETUP & GEOGRAPHIC REGISTRY

SOPs require all cases and field executives to map to physical branch locations to ensure geofencing accuracy.

### 6.1 Creating a Physical Branch Node
1. Navigate to **System Directory** -> **Branch Registry** -> **Create New Branch Node**.
2. Input the branch name: e.g., `Mumbai Central Branch Office`.
3. Select the geographic state and assign the regional supervisor.
4. Input the precise GPS coordinates of the branch office and define the geofence perimeter:

```
Branch Geofence Perimeter:
Latitude:  18.9696 N  ──────────┐
Longitude: 72.8194 E  ──────────┼──► [ Standard Radius: 500 Meters ]
```

5. Click **Verify Perimeter**. The system draws an interactive map showing the active geofenced area.
6. Click **Activate Branch**. The branch is assigned a unique identifier (e.g. `BR-MUM-001`) and is ready for staff and case allocation.

---

## 7. USER, ROLE & PERMISSION MANAGEMENT

Security governance mandates strict Role-Based Access Control (RBAC). Super Admins manage the platform's security boundaries, assigning users to predefined, isolated roles.

### 7.1 Enterprise RBAC Authorization Matrix

| Access Domain Role | Screen Views Permitted | Permitted Database Actions | Max Case Exposure Limit | Timeout Threshold |
| :--- | :--- | :--- | :--- | :---: |
| **Super Admin** | Platform-Wide (All Views) | Full Access (Create, Read, Update, Soft-Delete) | Unlimited | 15 Minutes |
| **National Head** | National Portfolios, BI Panels | Read, Verify Approvals | Unlimited | 30 Minutes |
| **State Manager** | Regional Performance, Approvals | Read, Update Allocations | State Portfolios | 30 Minutes |
| **Branch Manager**| Branch Dashboards, Attendance | Read, Approve Settlements | Branch Portfolios | 60 Minutes |
| **Recovery Agent**| Mobile Field Application | Read Assigned Case, Upload Visit Logs | Max 15 Active Cases | 8 Hours |

### 7.2 Customizing Role Permission Scopes
1. Navigate to **Access Control** -> **Role Governance Desk**.
2. Select a target role: e.g., `Branch Manager`.
3. Toggle granular permission flags on or off:
   - `case.allocate` (Permit case reassignment)
   - `settlement.approve` (Permit settlement proposals)
   - `attendance.override` (Permit manual geofence clock-in override)
4. Click **Apply Permission Package**. The changes take effect across all active sessions within 60 seconds.

---

## 8. EMPLOYEE DIRECTORY & FIELD FORCE ONBOARDING

Every operator, supervisor, and field recovery agent must have a verified profile in the Employee Directory before being granted system access.

### 8.1 Adding an Employee Profile
1. Navigate to **Human Resources** -> **Staff Roster** -> **Add Employee Record**.
2. Complete the employee identification form:
   - Provide the employee's legal first name, last name, and date of birth.
   - Input their corporate email address: `user@sanjaydangi.com`.
   - Assign the employee to a physical branch: e.g., `Mumbai Central Branch Office`.
   - Set the base salary, target metrics, and commission tier.
3. Attach a clear, professional photo of the employee to use as their facial verification baseline for mobile check-ins.
4. Click **Onboard Employee**. The system generates a secure temporary login password, sends an activation email, and logs the action to the audit trail.

---

## 9. RECOVERY CASE ASSIGNMENT & DISPERSION ENGINE

EDROS supports both automated and manual case allocation, ensuring portfolios are distributed efficiently to branch teams and field executives.

### 9.1 Automatic Allocation Strategy
1. Navigate to **Case Management** -> **Allocation Engines** -> **Auto-Assign Rules**.
2. Select the parent tenant bank portfolio: e.g., `State Bank of India`.
3. Choose the target allocation algorithm:
   - **Load-Balanced Distribution:** Distributes cases evenly across available field agents based on their current case volume.
   - **Geographic Proximity Match:** Allocates cases to agents whose registered home coordinates are closest to the debtor's residential address.
   - **Balance Recovery Score:** Prioritizes higher-risk, larger-balance cases, routing them to senior recovery executives.
4. Click **Dry Run Analysis**. The system calculates a preview mapping of the case distribution.
5. Review the test mapping, then click **Execute Batch Allocation**.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: Case Assignment Workspace                    |
| Capture the dry run preview screen, showing the distribution chart, the     |
| caseload balance meters, and the 'Execute Batch Allocation' button.        |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 10. TARGET MANAGEMENT & COMMISSION INCENTIVES

To drive collection performance, Super Admins configure performance targets, KPI thresholds, and commission structures.

### 10.1 Configuring Target Goals
1. Navigate to **Performance Desk** -> **Target Management** -> **Set Target Goals**.
2. Select the target level: **Individual Agent**, **Team/Branch**, or **Region**.
3. Define the monthly collection quota: e.g., `INR 500,000`.
4. Configure the commission payout tiers:
   - **Base Recovery Tier:** Up to 80% of target met = Base Salary only.
   - **Target Achieved Tier:** 81% to 100% of target met = 2% commission on recovered balances.
   - **Overachiever Tier:** Greater than 100% of target met = 5% commission on recovered balances.
5. Click **Publish Targets**. Targets are pushed to team dashboards and updated in real-time.

---

## 11. SYSTEM AUDIT TRAILS & ACTIVITY LOGS

In compliance with financial regulations, all write and update operations inside EDROS trigger immutable audit records.

### 11.1 Accessing the Platform Audit Vault
1. Navigate to **Diagnostics Desk** -> **System Audit Trails**.
2. Use the search filters to isolate specific events:
   - **User ID:** Filter by the operator's corporate email address.
   - **Action Type:** Filter by system actions (`case.update`, `settlement.approve`, `user.onboard`).
   - **Date Range:** Select a specific timeframe.
3. Review the transaction ledger details:

```
AUDIT LOG RECORD:
Timestamp:  2026-07-15 02:40:15 UTC
User Email: manager@sanjaydangi.com
Action:     settlement.approve
IP Address: 103.45.12.82
Payload:    { "case_id": "SBI-90210", "settlement_haircut": "22.5%" }
Payload Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

4. Audit logs are cryptographically sealed and cannot be modified or deleted, preserving a reliable history for regulatory audits.

---

## 12. REPORTS, ANALYTICS & REVENUE FORECASTS

Super Admins access comprehensive reports to track performance, evaluate recovery trends, and forecast platform revenue.

### 12.1 Running Recovery Reports
1. Navigate to **Analytics Desk** -> **Reports Console**.
2. Select the report type: e.g., **Monthly Debt Recovery Summary**.
3. Choose the scope (Branch, Regional, or National) and select the date range.
4. Click **Compile Report**. The platform pulls the transactional data, generates charts, and compiles the report.
5. Click **Export PDF**. The system packages the document as a watermarked, signed PDF and saves a copy to the secure R2 object store.

---

## 13. INFRASTRUCTURE MONITORING & HEALTH CHECKS

Super Admins monitor infrastructure performance and queue latency to ensure platform stability.

```
+─────────────────────────────────────────────────────────────────────────────+
| INFRASTRUCTURE TELEMETRY STATUS PANEL                                       |
|                                                                             |
| Next.js API Routes:  [ Healthy ] - Average Ingress Latency: 112ms           |
| Neon Database Pool:  [ Healthy ] - Active pgBouncer Connections: 42         |
| Upstash Redis Cache: [ Healthy ] - Active Task Queue: 0 Queued              |
| Railway Workers:     [ Healthy ] - CPU: 12% - Memory: 42%                   |
+─────────────────────────────────────────────────────────────────────────────+
```

### 13.1 Checking Telemetry Services
1. Navigate to **Diagnostics Desk** -> **System Telemetry**.
2. Review connection pools, memory utilization, and cache latency metrics.
3. If background queue tasks (such as notice generation or SMS campaigns) are delayed, monitor active worker containers on Railway and scale resources if necessary.

---

## 14. SYSTEM SETTINGS & ENVIRONMENT POLICIES

Super Admins configure system-wide security settings and environment policies to keep the platform compliant with regional regulations.

### 14.1 Configuring the Operational Time Gate
To comply with RBI guidelines, outreach activities (automated messages, field visits) are restricted to permitted contact hours.
1. Navigate to **System Settings** -> **Core Configuration** -> **Operational Time Gate**.
2. Set the allowed communication window: e.g., Start: `08:00 AM` | End: `07:00 PM` (UTC+5:30).
3. Select the enforcement rule: **Hard Lockout** (locks field executive screens and disables outreach APIs outside of the allowed window).
4. Click **Apply System Policies**.

---

## 15. BACKUP, RESTORE & DISASTER RECOVERY ACTIONS

To protect transaction logs and debtor portfolios, EDROS maintains automated backups with options for manual recovery.

### 15.1 Running a Manual Database Backup
1. Navigate to **Diagnostics Desk** -> **Backups & Recovery**.
2. Click **Create Manual Snapshot**.
3. Select the target database schema: `EDROS_PROD_SCHEMA`.
4. Click **Initialize Backup**. The system initiates a Neon database snapshot, packages the backup, and uploads the file to the secure R2 store.
5. Verify the backup is complete by checking the backup ledger for the new snapshot ID and its validation status.

---

## 16. DAILY, WEEKLY, AND MONTHLY OPERATIONS CHECKLISTS

To ensure operational stability and security compliance, Super Admins must complete these checklist reviews:

### 16.1 Daily Checklist (IT Operations)
* [ ] **System Telemetry Review:** Check that edge latency is `< 150ms` and database connection pools are healthy.
* [ ] **Background Queue Check:** Confirm that Upstash Redis and BullMQ queues are processing without bottlenecks or errors.
* [ ] **Error Logs Check:** Monitor Sentry and Pino streams for unexpected errors or exceptions.

### 16.2 Weekly Checklist (Security & User Compliance)
* [ ] **User Roster Audit:** Review the active employee list, disabling access for retired or transferred staff members.
* [ ] **Audit Trail Scan:** Verify that all high-priority write operations have corresponding cryptographically sealed audit records.
* [ ] **Backup Verification:** Confirm that automated daily Neon database backups are executing successfully.

### 16.3 Monthly Checklist (Performance & Reporting)
* [ ] **Target Performance Review:** Confirm that monthly performance metrics and commission targets are updated for all branches.
* [ ] **Infrastructure Capacity Check:** Evaluate storage and compute usage, adjusting Railway worker limits or Neon scaling bounds if needed.
* [ ] **Regulatory Compliance Audit:** Confirm that data masking settings and contact hour restrictions are active.

---

## 17. BEST PRACTICES & SECURITY SAFEGUARDS

* **Enforce Least Privilege:** Never share Super Admin credentials or use administrative accounts for routine operational tasks. Assign users to specific roles matching their daily responsibilities.
* **Keep Environments Isolated:** Never connect development or testing branches to the production database. Use separate, masked database branches for testing schemas and new features.
* **Review API Tokens Regularly:** Periodically review active third-party integration keys, rotating secret keys every 90 days to minimize credential exposure risks.

---

## 18. COMMON MISTAKES & OPERATIONAL PITFALLS

* **Ignoring Background Queue Spikes:** Failing to monitor background queues can delay time-sensitive tasks, such as generating court notices or processing collections.
  * *Correction:* Monitor queue metrics daily, and scale Railway worker containers horizontally to handle sudden volume spikes.
* **Improper Geofence Tolerances:** Setting overly restrictive geofences around physical branches can prevent field agents from checking in due to natural GPS signal drift.
  * *Correction:* Standardize geofences to a minimum radius of 500 meters to accommodate GPS signal variances.
* **Bypassing Ingestion Formatting Checks:** Uploading debtor portfolios with missing or incorrectly formatted fields can corrupt database records and break downstream workflows.
  * *Correction:* Always run ingestion files through the validation checker before executing batch database writes.

---

## 19. TROUBLESHOOTING & EMERGENCY PLAYBOOK

### 19.1 System Latency and Slow Database Queries
* **Symptom:** Operations staff report slow screen load times and timeout errors when saving records.
* **Diagnostic Steps:** Check active connection pools and identify slow-running database queries.
* **Resolution:** Re-route connections through pgBouncer pools, and verify that appropriate composite indexes are applied to frequently filtered fields.

### 19.2 Field Executive Location Synchronization Failures
* **Symptom:** Mobile agents are unable to submit field reports due to coordinate mismatch errors.
* **Diagnostic Steps:** Check mobile device GPS settings and verify branch geofence definitions.
* **Resolution:** Ensure the agent's device has location services active, and adjust geofence perimeters in the Branch Registry if necessary.

---

## 20. VALIDATION CHECKLIST & SYSTEM SMOKE TESTING

Before promoting configuration changes or new database schemas to the production environment, verify system stability against this checklist:

* [ ] **Database Connection:** Verify that Prisma can successfully connect to production Neon database pools.
* [ ] **Queue Integrity:** Confirm that Upstash Redis is online and accepting BullMQ task assignments.
* [ ] **Storage Upload:** Confirm that files can be saved to and retrieved from the secure Cloudflare R2 bucket.
* [ ] **WAF Perimeter Active:** Verify that Cloudflare Edge Web Application Firewall (WAF) rules are active and blocking unauthorized requests.
* [ ] **Audit Trail Active:** Confirm that state-modifying actions trigger sealed logs with matching user context.

---

## 21. FAQ SECTION

#### Q1: Can a Super Admin retrieve an operator's forgotten login password?
No. To maintain security and compliance, user passwords are encrypted. Administrators can trigger a secure password reset link, but they cannot view or manually edit existing passwords.

#### Q2: What happens if a field agent checks in outside the branch's assigned geofence?
The system rejects the clock-in attempt and logs a coordinate mismatch event to the audit trail. Branch managers can manually override the geofence restriction if necessary, which logs an override reason to the audit ledger.

#### Q3: How do we delete an onboarded bank portfolio that is no longer active?
To comply with financial regulatory guidelines, data rows cannot be permanently deleted. Bank portfolios must be marked as `Inactive` in the client directory, which soft-deletes the records and hides them from active dashboards.

---

## 22. GLOSSARY & REFERENCES

### 22.1 Glossary of Terms
* **RBAC:** Role-Based Access Control. A method of restricting system access to authorized users based on their organizational role.
* **MFA:** Multi-Factor Authentication. Requires users to verify their identity using multiple independent credentials.
* **Tenant:** An isolated client or operational domain (such as a partner bank) within a multi-tenant software system.
* **Geofence:** A virtual geographic boundary defined by GPS coordinates that triggers actions when a device enters or exits the perimeter.
* **Audit Trail:** An immutable, chronological record of system events and database updates.

### 22.2 Regulatory & System References
1. **Reserve Bank of India (RBI):** Guidelines on Fair Practices Code and Debt Collection Standards.
2. **Digital Personal Data Protection Act, 2023:** India’s framework for protecting personal identifiers and managing data consent.
3. **ISO/IEC 27001 Security Standards:** Guidelines for establishing, implementing, and auditing information security management systems.

---

## 23. APPENDIX

### 23.1 Configuration Value Reference
The following table defines default configuration limits and operational parameters for the EDROS production environment:

| Configuration Parameter | Default Value | Unit | Purpose |
| :--- | :--- | :---: | :--- |
| **Max Inactivity Timeout** | 15 | Minutes | Time before idle admin sessions are automatically terminated. |
| **Password Expiry Period** | 90 | Days | Calendar days before users are prompted to update their passwords. |
| **Max Batch Upload Size** | 50 | Megabytes | Maximum file size allowed for debtor portfolio uploads. |
| **Rate Limit Window** | 100 | Requests / Min | Maximum API requests allowed per client IP before rate-limiting triggers. |

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
