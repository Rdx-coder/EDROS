# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-OPS-REM-007
## VERSION: 1.0.0
## CLASSIFICATION: INTERNAL ONLY (LEVEL 2 - OPERATIONAL STAFF)

---

# DOCUMENT 7: RECOVERY EXECUTIVE MOBILE INTERFACE MANUAL

```
================================================================================
               R E C O V E R Y   E X E C U T I V E   M O B I L E
                            I N T E R F A C E   M A N U A L
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Chief Operations Officer (COO)
Co-Authors:   Director of Regional Recovery, Lead Compliance Auditor
Reviewer:     Chief Compliance Officer (CCO), Team Leader
Approver:     Chief Technology Officer & Operations Control Board
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline issue of the Recovery Executive Mobile Interface Manual for EDROS v1.0.0. | Chief Operations Officer | CTO & Operations Control Board |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [APPLICABLE STANDARDS & COMPLIANCE BOUNDARIES](#2-applicable-standards--compliance-boundaries)
3. [DEFINITIONS](#3-definitions)
4. [SYSTEM OVERVIEW & MOBILE INTERFACE](#4-system-overview--mobile-interface)
5. [NAVIGATION & OPERATION FLOW](#5-navigation--operation-flow)
6. [DAILY LOGIN, GPS GEOFENCING & SYSTEM SYNC](#6-daily-login-gps-geofencing-and-system-sync)
7. [ACTIVE TASK QUEUES & DEBTOR PROFILE VIEWS](#7-active-task-queues-and-debtor-profile-views)
8. [EXECUTING PHYSICAL VISITS & GPS CHECK-INS](#8-executing-physical-visits-and-gps-check-ins)
9. [CASH COLLECTION & DIGITAL RECEIPTING SOP](#9-cash-collection-and-digital-receipting-sop)
10. [SUBMITTING SETTLEMENT PROPOSALS VIA MOBILE](#10-submitting-settlement-proposals-via-mobile)
11. [GEOFENCE DISPUTE LOGGING & OVERRIDE PROCEDURES](#11-geofence-dispute-logging-and-override-procedures)
12. [OPERATIONAL KEY PERFORMANCE INDICATORS (KPIS)](#12-operational-key-performance-indicators-kpis)
13. [GOVERNANCE CONTROLS & MONITORING SEALS](#13-governance-controls--monitoring-seals)
14. [DAILY AND WEEKLY SOP CHECKLISTS](#14-daily-and-weekly-sop-checklists)
15. [BEST PRACTICES & FIELD SAFETY STRATEGIES](#15-best-practices-and-field-safety-strategies)
16. [COMMON MISTAKES & FIELD PITFALLS](#16-common-mistakes-and-field-pitfalls)
17. [TROUBLESHOOTING & TECHNICAL ASSISTANCE](#17-troubleshooting-and-technical-assistance)
18. [VALIDATION CHECKLIST & DEVICE HARDENING](#18-validation-checklist-and-device-hardening)
19. [FAQ SECTION](#19-faq-section)
20. [GLOSSARY & REFERENCES](#20-glossary--references)
21. [APPENDIX](#21-appendix)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
This operations manual establishes the definitive procedural framework and standard operating guidelines for Recovery Executives (REs) utilizing the mobile application of the Enterprise Debt Recovery Operating System (EDROS). This document provides step-by-step instructions for completing daily task queues, executing GPS-geofenced check-ins, collecting cash and signing digital receipts, and logging geofence disputes in a compliant manner.

### 1.2 Scope
This manual governs all front-line mobile workflows exposed within the `Recovery Executive Mobile App` of EDROS, including:
* **Daily Authentication and Database Syncing:** Logging in, verifying device GPS connectivity, and downloading active daily workloads.
* **Debtor Profile and Visited Location Views:** Accessing assigned cases, outstanding balances, payment histories, and mapping details securely.
* **GPS-Geofenced Check-Ins:** Completing visit verifications within the mandated GPS boundary radius.
* **Cash Collections and Receipting:** Documenting physical transactions, compiling collection logs, and generating digital receipts.
* **Geofence Override Requests:** Logging physical visit exceptions and coordinate discrepancies for team leader review.

### 1.3 Target Audience
This operations manual is written for:
* **Recovery Executives (REs)** and Front-Line Field Agents utilizing the EDROS mobile application to execute physical debtor outreach.
* **Team Leaders (TLs)** and Branch Managers auditing agent check-ins, route maps, and field collections.
* **Mobile Developers and SRE Leads** verifying that application telemetry and synchronization loops align with security specifications.

---

## 2. APPLICABLE STANDARDS & COMPLIANCE BOUNDARIES

The Recovery Executive operates on the direct front line, interacting directly with borrowers. All field activities, check-ins, and collections must align with:

```
┌─────────────────────────────────────────────────────────────┐
│                 COMPLIANCE CONTROL RING                     │
├───────────────┬─────────────────────────────────────────────┤
│ RBI FPC       │ Fair Practices Code for Lenders             │
├───────────────┼─────────────────────────────────────────────┤
│ DPDP Act      │ Digital Personal Data Protection Act (2023) │
├───────────────┼─────────────────────────────────────────────┤
│ ISO 27001     │ Mobile Device Encryption & Identity Security │
├───────────────┼─────────────────────────────────────────────┤
│ SLA Targets   │ Visit Execution & Dispute Logging Timelines │
└───────────────┴─────────────────────────────────────────────┘
```

> **CRITICAL COMPLIANCE NOTICE:** Under Reserve Bank of India (RBI) guidelines, all field visits and borrower outreach must execute strictly between 08:00 and 19:00. Any contact attempt or check-in recorded outside of these hours constitutes a critical compliance violation, resulting in immediate account lockout and disciplinary review.

---

## 3. DEFINITIONS

* **Sovereign Database Synchronization:** The local SQLite sync process that downloads assigned case profiles and masks PII data on the executive's device.
* **GPS Geofence Radius (100m):** The mandatory geographical boundary surrounding a debtor's registered coordinates. The mobile application blocks check-ins executed outside this radius.
* **Transit Chain of Custody:** The sequence of secure steps tracking collected cash from the debtor's premises to final verification at the physical branch.
* **Time-Gated Operational Lock:** An automated application lock that prevents access to debtor profiles, task queues, and check-in tools outside of permissible hours (08:00 to 19:00).
* **Cryptographic Visit Stamp:** An immutable ledger entry generated upon a successful geofenced check-in, tracking the GPS coordinates, timestamp, and device parameters.

---

## 4. SYSTEM OVERVIEW & MOBILE INTERFACE

The Recovery Executive Mobile App provides a secure, lightweight client application designed for field-based debt recovery operations. Integrating on-device GPS, offline databases, camera captures, and secure communication tunnels, the app allows the field executive to execute assigned portfolios efficiently.

### 4.1 Platform Data Streams & Storage Integration
The mobile client is integrated with the core EDROS platform architecture:
* **Neon PostgreSQL Master Instance:** Synchronizes active rosters, case lists, assigned targets, and security tokens on login.
* **Upstash Redis Cluster:** Processes real-time GPS coordinate arrays, geofence validations, and active agent session keys.
* **Cloudflare R2 Object Storage:** Uploads watermarked visit photographs, signed settlement agreements, and cash collection receipts.

---

## 5. NAVIGATION & OPERATION FLOW

The EDROS mobile client features a simple, gesture-friendly navigation layout designed to keep vital tasks and tools quickly accessible:

```
[ EDROS Mobile Interface ]
          │
          ├──► [ Active Task Queue ] (Assigned Cases, Map Integrations, Priority Sliders)
          │
          ├──► [ Visit execution ] (Debtor Profiles, GPS Check-ins, Landmarking)
          │
          ├──► [ Cash & Receipting Panel ] (Cash Collection, Digitized Receipts, Barcode Scanners)
          │
          ├──► [ Settlement Console ] (SBM Proposal Generator, Review Interface)
          │
          └──► [ Dispute & Exception Desk ] (Failed GPS Audits, Override Submissions)
```

---

## 6. DAILY LOGIN, GPS GEOFENCING & SYSTEM SYNC

To begin the operational day, the field executive must pass security authentication and synchronize their local database:

### 6.1 Daily Setup and Database Synchronization
1. Daily Sign-In (08:00): Launch the application and enter your corporate credentials.
2. Device Inspection: The system conducts automated device health checks, verifying active GPS connectivity and locking access if root or mock location tools are detected.
3. Database Sync: Tap **Synchronize Daily Queue**. The application connects to Neon PostgreSQL and downloads your assigned accounts.
4. Time Lock Status: Confirm that the application displays "Time Gate Active: 08:00 - 19:00" and that all tools are unlocked.

---

## 7. ACTIVE TASK QUEUES & DEBTOR PROFILE VIEWS

The Active Task Queue displays your assigned cases, sorted by geographic proximity and collection priority:

```
+─────────────────────────────────────────────────────────────────────────────+
| ACTIVE TASK QUEUE (FIELD MODE)                                              |
|                                                                             |
| Case 1: [ CASE-HDFC-MUM-10250 ] - Distance: 1.2 km - Priority: CRITICAL     |
| Case 2: [ CASE-HDFC-MUM-10252 ] - Distance: 2.8 km - Priority: HIGH         |
| Case 3: [ CASE-HDFC-MUM-10255 ] - Distance: 4.5 km - Priority: MEDIUM       |
| Active Daily Target: [ INR 25,000 ] - Collected Month-to-Date: 72.4%        |
+─────────────────────────────────────────────────────────────────────────────+
```

### 7.1 Reviewing Debtor Case Details
* **Debtor Profile View:** Provides vital case parameters, including the debtor's full outstanding balance, payment history, and collection guidelines.
* **Map Route Integration:** Tap **Navigate to Debtor** to open optimized driving directions to the borrower's address.
* **Protected PII:** Debtor personal data is masked or encrypted on-device, conforming strictly to DPDP Act data protection regulations.

---

## 8. EXECUTING PHYSICAL VISITS & GPS CHECK-INS

To confirm physical field visits and maintain compliance, the executive must complete a GPS-geofenced check-in:

### 8.1 Initiating GPS Check-Ins
1. Navigate to the debtor's physical premises.
2. Once at the location, open the assigned account profile and tap **Execute GPS Check-In**.
3. Geofence Verification: The application requests device location coordinates, verifying them against the registered debtor coordinates in the database.
4. Landmarking Verification: If the coordinates match within the 100-meter radius, the app prompts for a watermarked landmark photo.
5. Visit Validation: Take a clear photo of the debtor's premises. The application processes the photo, validates the check-in, and logs a cryptographic visit stamp.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: GPS Check-In Screen                          |
| Capture the mobile GPS check-in page, focusing on the geofence indicator circle,|
| coordinate status values, and the "Take Visit Photo" camera triggers.       |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 9. CASH COLLECTION & DIGITAL RECEIPTING SOP

To protect margins and prevent accounting errors, cash collections must follow a strict, multi-step validation process:

```
┌─────────────────────────────────────────────────────────────┐
│                    CASH COLLECTION FLOW                     │
├───────────────┬─────────────────────────────────────────────┤
│ STEP 1        │ Executive collects cash & verifies amount   │
├───────────────┼─────────────────────────────────────────────┤
│ STEP 2        │ Log transaction details via mobile client   │
├───────────────┼─────────────────────────────────────────────┤
│ STEP 3        │ Debtor confirms details via secure SMS OTP   │
├───────────────┼─────────────────────────────────────────────┤
│ STEP 4        │ Generate watermarked digital receipt        │
└───────────────┴─────────────────────────────────────────────┘
```

### 9.1 Recording Physical Cash Collections
1. Receive physical cash from the debtor.
2. Navigate to **Cash & Receipting Panel** -> **Record Collection**.
3. Select the active case and enter the precise cash amount (e.g., *INR 15,000*).
4. Debtor OTP Verification: Tap **Send Verification OTP**. The system sends a secure SMS OTP to the debtor's registered mobile number.
5. Enter the OTP provided by the debtor to verify the transaction details.
6. Click **Generate Digital Receipt**. The system generates a watermarked receipt, cryptographically signs the ledger, and saves the file to Cloudflare R2 object storage.

---

## 10. SUBMITTING SETTLEMENT PROPOSALS VIA MOBILE

If a debtor requests a standard or exceptional settlement write-off, the executive can submit a proposal via the mobile client:

### 10.1 Submitting a Settlement Proposal
1. Open the debtor's account profile and navigate to **Settlement Console**.
2. Tap **Create Settlement Proposal**.
3. Enter the proposed haircut percentage (e.g., *14.50%*) and the debtor's payment schedule.
4. Upload a brief justification log explaining the proposal details (e.g., *borrower's financial distress and matching physical visit logs*).
5. Tap **Submit Proposal**. The application locks the account, updates the case status, and routes the proposal to the Team Leader's queue for formal review.

---

## 11. GEOFENCE DISPUTE LOGGING & OVERRIDE PROCEDURES

If GPS drift or physical access limitations block a standard check-in, the executive must log a geofence dispute:

### 11.1 Submitting Geofence Override Requests
1. If the GPS check-in fails with a geofence mismatch, tap **Log Geofence Dispute**.
2. The application opens the geofence dispute screen, automatically logging your GPS coordinates and device parameters.
3. Take a clear landmark photo of the debtor's premises to confirm your physical presence.
4. Enter a brief description of the access limitations or GPS drift (e.g., *deep valley area; landmark photo confirms location*).
5. Tap **Submit Dispute**. The application saves the dispute records and routes the request to your Team Leader for initial triage.

---

## 12. OPERATIONAL KEY PERFORMANCE INDICATORS (KPIS)

Field executive performance is tracked against key performance indicators (KPIs) to monitor compliance and recovery metrics.

```
+─────────────────────────────────────────────────────────────────────────────+
| RECOVERY EXECUTIVE PERFORMANCE TARGETS                                      |
|                                                                             |
| Daily Visit Completion:    [ Target: > 80.00% Scheduled ]                   |
| Geofence Success Rate:     [ Target: > 98.00% Passed ]                      |
| Roster Sync Compliance:    [ Target: 100.00% On-Time ]                      |
| Cash Deposit Accuracy:     [ Target: 0.00% Variance ]                       |
+─────────────────────────────────────────────────────────────────────────────+
```

* **Daily Visit Completion:** Complete and log 80.00% or more of your assigned scheduled daily visits.
* **Geofence Success Rate:** 98.00% or more of completed visits must pass GPS-geofenced verification.
* **Roster Sync Compliance:** Sync your database and log in on time (08:00) daily.

---

## 13. GOVERNANCE CONTROLS & MONITORING SEALS

Governance and security standards are enforced through automated controls built directly into the platform:

* **Sovereign Portfolio Separation:** Tenant banking data is isolated at the schema level, ensuring data privacy.
* **Operational Time Locks:** Enforces system-wide lockouts outside of RBI-permitted hours (08:00 to 19:00).
* **Closed-Loop Geofencing:** Verifies field coordinates against branch geofences during check-ins, logging mismatch alerts to the audit trail.

---

## 14. DAILY AND WEEKLY SOP CHECKLISTS

The Recovery Executive must complete these checklists to verify performance and compliance:

### 14.1 Daily Checklist (Field Execution)
* [ ] **Morning Login:** Log in at 08:00, verify GPS connectivity, and sync your daily task queue.
* [ ] **Route Map Review:** Review assigned cases and route maps, planning your travel sequence.
* [ ] **Geofenced Check-In:** Complete a GPS-geofenced check-in and landmark photo for every physical visit.
* [ ] **Cash Reconciliation:** At the end of the operational day, verify and reconcile physical cash collections with digital logs.

### 14.2 Weekly Checklist (System Audits)
* [ ] **Roster Synchronization:** Verify your staffing records and active device connections.
* [ ] **Dispute Auditing:** Audit your logged geofence disputes, confirming all overrides have matching justification records.
* [ ] **Database Refresh:** Run a complete sovereign database synchronization to refresh local collections.

---

## 15. BEST PRACTICES & FIELD SAFETY STRATEGIES

* **Verify GPS Accuracy:** Confirm your device GPS signal strength before initiating a geofenced check-in.
* **Enforce Safe Custody:** Transport physical cash in secure transit envelopes and deposit funds promptly at the branch office.
* **Respect Borrower Communication:** Maintain polite and professional discussions, adhering strictly to RBI contact rules.

---

## 16. COMMON MISTAKES & FIELD PITFALLS

* **Attempting Visits Outside Hours:** Conducting visits outside of RBI-permitted hours (08:00 to 19:00) is a critical compliance breach.
  * *Correction:* Adhere strictly to the time-gated operational locks.
* **Completing Check-Ins Outside Radius:** Logging check-ins outside the assigned geofence perimeter causes automated compliance alerts.
  * *Correction:* Move within the 100-meter geofence radius before initiating check-ins.
* **Failing to Generate Receipts:** Accepting debtor cash without generating a verified digital receipt leads to immediate audit warnings.
  * *Correction:* Always send a debtor OTP and generate a watermarked digital receipt.

---

## 17. TROUBLESHOOTING & TECHNICAL ASSISTANCE

### 17.1 Location Services Connection Failures
* **Symptom:** App displays "GPS Signal Lost" or blocks check-in triggers.
* **Diagnostic Steps:** Check device location settings, ensuring high-accuracy mode is enabled.
* **Resolution:** Move to an open area with a clear line of sight, restarting location services if needed.

### 17.2 Database Sync Failure
* **Symptom:** Task queue displays blank or outdated accounts on login.
* **Diagnostic Steps:** Check mobile data connectivity and verify server access.
* **Resolution:** Move to a stable network area and tap **Synchronize Daily Queue** again.

---

## 18. VALIDATION CHECKLIST & DEVICE HARDENING

Before beginning field operations, verify device compliance against this checklist:

* [ ] **GPS Location Mode:** Confirm device location settings are configured to high-accuracy mode.
* [ ] **Mock Location Guard:** Verify mock location and developer mode options are disabled.
* [ ] **Secure Local Database:** Ensure SQLite data encryption is active and database tables are locked.
* [ ] **Application Integrity:** Verify the active client version matches the latest corporate release.

---

## 19. FAQ SECTION

#### Q1: What happens if I am unable to check in due to physical access limits?
If physical barriers block your check-in, move as close as possible and tap **Log Geofence Dispute**. Take a clear landmark photo and submit a dispute details record for your Team Leader's review.

#### Q2: What should I do if a debtor refuses to share the OTP?
Do not complete the transaction. Explain that the OTP is required to verify the payment and generate a digital receipt. If they still refuse, contact your Team Leader immediately.

#### Q3: Can I complete a scheduled visit at 19:30?
No. All debtor outreach must execute within RBI-permitted hours (08:00 to 19:00). The mobile application blocks check-ins and tasks outside this window.

---

## 20. GLOSSARY & REFERENCES

### 20.1 Glossary of Terms
* **OTP:** One-Time Password. A secure, single-use authentication code sent via SMS.
* **SQLite:** A lightweight, self-contained SQL database engine used to manage on-device collections.
* **PII:** Personally Identifiable Information. Any data that could potentially identify a specific individual.
* **SLA:** Service Level Agreement. Predefined targets for response and resolution times.
* **CAPA:** Corrective and Preventive Action. A structured process used to resolve and prevent non-conformities.

### 20.2 Regulatory & System References
1. **Reserve Bank of India (RBI):** Directions on Fair Practices Code and Debt Collection Standards.
2. **Digital Personal Data Protection Act, 2023:** Act No. 26 of 2023, Government of India.
3. **ISO 27001:2022:** Guidelines for Data Privacy and System Access Security.
4. **Cloudflare WAF Documentation:** Guide for configuring edge web application firewalls and DDoS protection rules.

---

## 21. APPENDIX

### 21.1 Collection Record Log Template
When physical collections are completed, the executive must log the details using the following structured template:

```
COLLECTION RECORD LOG:
Record ID:      COL-REM-2026-0701
Date Logged:    2026-07-15 03:50:00 UTC
Branch Office:  Mumbai Central Branch (BR-MUM-001)
Executive Name: Rajesh Kumar (EMP-MUM-024)
Debtor ID:      DBT-HDFC-MUM-412
Collected Cash: INR 15,000 (Fifteen Thousand Only)
OTP Status:     VERIFIED & MATCHED (Logged to collection ledger)
```

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
