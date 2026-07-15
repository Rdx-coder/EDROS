# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-OPS-BMM-004
## VERSION: 1.0.0
## CLASSIFICATION: INTERNAL ONLY (LEVEL 2 - OPERATIONAL STAFF)

---

# DOCUMENT 4: BRANCH MANAGER OPERATIONS MANUAL

```
================================================================================
                 B R A N C H   M A N A G E R   O P E R A T I O N S
                                 M A N U A L
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Chief Operations Officer (COO)
Co-Authors:   Regional Recovery Director, Lead Systems Auditor
Reviewer:     Chief Compliance Officer (CCO), State Operations Manager
Approver:     Chief Technology Officer & Operations Control Board
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline release of the Branch Manager Operations Manual for EDROS v1.0.0. | Chief Operations Officer | CTO & Operations Control Board |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [APPLICABLE STANDARDS & COMPLIANCE BOUNDARIES](#2-applicable-standards--compliance-boundaries)
3. [DEFINITIONS](#3-definitions)
4. [SYSTEM OVERVIEW & BRANCH MANAGER PORTAL](#4-system-overview--branch-manager-portal)
5. [NAVIGATION & OPERATION FLOW](#5-navigation--operation-flow)
6. [CASE ALLOCATION & FIELD FORCE WORKLOADS](#6-case-allocation--field-force-workloads)
7. [LOCAL BRANCH PERFORMANCE DASHBOARD](#7-local-branch-performance-dashboard)
8. [RECONCILIATION & CASH TRANSIT RULES](#8-reconciliation--cash-transit-rules)
9. [EXECUTIVE PERFORMANCE ANALYSIS](#9-executive-performance-analysis)
10. [LOCAL SETTLEMENT APPROVALS SOP (HAIRCUTS <= 20.00%)](#10-local-settlement-approvals-sop-haircuts--2000)
11. [GEOFENCE DISPUTES & COORDINATE OVERRIDES](#11-geofence-disputes--coordinate-overrides)
12. [OPERATIONAL KEY PERFORMANCE INDICATORS (KPIS)](#12-operational-key-performance-indicators-kpis)
13. [GOVERNANCE CONTROLS & MONITORING SEALS](#13-governance-controls--monitoring-seals)
14. [DAILY, WEEKLY, AND MONTHLY SOP CHECKLISTS](#14-daily-weekly-and-monthly-sop-checklists)
15. [BEST PRACTICES & LOCAL FIELD STRATEGIES](#15-best-practices--local-field-strategies)
16. [COMMON MISTAKES & OPERATIONAL PITFALLS](#16-common-mistakes--operational-pitfalls)
17. [TROUBLESHOOTING & TECHNICAL ESCALATIONS](#17-troubleshooting--technical-escalations)
18. [VALIDATION CHECKLIST & SYSTEM SMOKE TESTING](#18-validation-checklist--system-smoke-testing)
19. [FAQ SECTION](#19-faq-section)
20. [GLOSSARY & REFERENCES](#20-glossary--references)
21. [APPENDIX](#21-appendix)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
This operations manual establishes the definitive procedural framework and standard operating guidelines for physical Branch Managers (BMMs) within the Enterprise Debt Recovery Operating System (EDROS). This document outlines step-by-step instructions for managing local case allocations, verifying mobile geofence check-ins, approving local debt settlements, coordinating daily cash reconciliations, and resolving field disputes in a compliant manner.

### 1.2 Scope
This manual governs all administrative and supervisory workflows exposed within the `Branch Manager Portal` of EDROS, including:
* **Local Case Allocation:** Assigning, rebalancing, and routing accounts to field executives based on proximity and performance metrics.
* **Geofence Check-In Verifications:** Managing and resolving field agent location discrepancies and manual check-in override requests.
* **Standard Settlement Approvals:** Evaluating proposed debt write-offs and settlement haircuts within the 0.01% to 20.00% threshold.
* **Daily Cash & Document Reconciliation:** Auditing collected funds and verifying that signed receipts match transaction databases.
* **Roster & Target Management:** Configuring executive rosters, assigning monthly performance targets, and tracking field activity logs.

### 1.3 Target Audience
This operations manual is written for:
* **Branch Managers (BMMs)** and Assistant Branch Supervisors managing physical branch offices and local recovery teams.
* **State Operations Managers (SMMs)** reviewing branch activities, case queues, and operational compliance.
* **Lead Auditors and Compliance Officers** verifying that local branch operations align with corporate standards and banking regulations.
* **Partner Bank Branch Supervisors** collaborating on co-allocated portfolios and local collection strategies.

---

## 2. APPLICABLE STANDARDS & COMPLIANCE BOUNDARIES

The Branch Manager operates at the direct intersection of field operations and regulatory requirements. All branch activities must align with:

```
┌─────────────────────────────────────────────────────────────┐
│                 COMPLIANCE CONTROL RING                     │
├───────────────┬─────────────────────────────────────────────┤
│ RBI FPC       │ Fair Practices Code for Lenders             │
├───────────────┼─────────────────────────────────────────────┤
│ DPDP Act      │ Digital Personal Data Protection Act (2023) │
├───────────────┼─────────────────────────────────────────────┤
│ ISO 27001     │ Data Privacy and Identity Management        │
├───────────────┼─────────────────────────────────────────────┤
│ SLA Targets   │ Case Allocation & Escalation Metrics        │
└───────────────┴─────────────────────────────────────────────┘
```

> **CRITICAL COMPLIANCE REMINDER:** Branch Managers must monitor agent contact hours strictly. All outreach and collections must execute exclusively within the RBI-permitted operational time window (08:00 to 19:00). Any out-of-hours contact is a critical compliance breach.

---

## 3. DEFINITIONS

* **Branch Recovery Coefficient (BRC):** The percentage metric tracking actual collected cash values against the branch's month-to-date collection target.
* **Geofence Radius Constraint:** The virtual, GPS-based perimeter (typically `100 meters`) surrounding a debtor's address, within which field executives must verify their physical visits.
* **Haircut Cap:** The maximum settlement write-off percentage (20.00%) that a Branch Manager is authorized to approve independently.
* **Port-to-Port Transit Chain:** The structured chain of custody tracking collected cash from the debtor's premises to final verification at the regional branch bank.
* **Case Rebalancing:** The systematic process of redistributing unallocated or stalled cases to high-performing field executives to optimize recovery speeds.

---

## 4. SYSTEM OVERVIEW & BRANCH MANAGER PORTAL

The Branch Manager Portal provides a secure, web-based control center for managing local branch operations and field recovery forces. Integrating data streams from mobile devices, transaction registers, and corporate databases, the portal allows the Branch Manager to supervise local recovery workflows.

### 4.1 Platform Data Streams & Storage Integration
The portal is fully integrated with the core EDROS platform architecture:
* **Neon PostgreSQL Master Instance:** Pulls local rosters, case details, target histories, and transaction ledgers assigned to the branch.
* **Upstash Redis Cluster:** Processes live GPS coordinates, active check-in streams, and rate limit counters for local field devices.
* **Cloudflare R2 Object Storage:** Archives watermarked demand notices, signed settlement receipts, and field-captured visit photos.

---

## 5. NAVIGATION & OPERATION FLOW

The Branch Manager Portal features a clean, tabbed navigation console designed to keep critical indicators and strategic workspaces quickly accessible:

```
[ Branch Manager Portal ]
          │
          ├──► [ Case Allocation Desk ] (Roster Setup, Workloads, Rebalancing Controls)
          │
          ├──► [ Performance & Roster Dashboard ] (Branch Metrics, Field Syncs, Live Check-ins)
          │
          ├──► [ Settlement & Haircut Approvals ] (SBM Approvals, Verification Queue)
          │
          └──► [ Escalation & Geofence Center ] (GPS Discrepancies, Override Workspace)
```

---

## 6. CASE ALLOCATION & FIELD FORCE WORKLOADS

The Case Allocation Desk allows the Branch Manager to manage executive rosters and distribute caseloads effectively.

### 6.1 Automated and Manual Case Assignment
The portal supports both manual and automated case allocation modes:
* **Automated Proximity Match:** The system automatically allocates cases to field executives based on their home coordinates, active branch boundaries, and historical recovery ratings.
* **Manual Rebalancing:** The Branch Manager can manually reallocate portfolios or transfer individual cases to balance workloads:
  - Drag-and-drop cases from the unassigned list to active executive profiles.
  - Set maximum workload caps (e.g., *max 40 active cases per agent*) to prevent executive burnout.
  - Automatically flag stagnant cases (e.g., *no visits logged for 14 days*) for immediate reallocation.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: Case Allocation Desk Panel                    |
| Capture the Case Allocation workspace, focusing on the agent workload sliders,|
| the unassigned case tables, and the proximity-match toggle indicators.      |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 7. LOCAL BRANCH PERFORMANCE DASHBOARD

The Branch Performance Dashboard provides a real-time overview of the branch's recovery operations and compliance levels:

```
+─────────────────────────────────────────────────────────────────────────────+
| BRANCH PERFORMANCE & COMPLIANCE CONSOLE                                     |
|                                                                             |
| MTD Collections:  [ INR 4,821,500 ]   - Progress to Target: 82.4%           |
| Active Caseload:  [ 820 Cases ]       - Checked-In Agents: 24/25            |
| Geofence Success: [ 98.42% Passed ]   - Unresolved Disputes: 1 Case         |
| Active Escalations: [ 2 Open Cases ]  - Compliance Infractions: 0           |
+─────────────────────────────────────────────────────────────────────────────+
```

### 7.1 Live Field Monitoring Widgets
* **Active Check-In Map:** An interactive local map showing the real-time positions of checked-in field executives and the locations of scheduled debtor visits.
* **Roster Sync Monitor:** A live roster feed displaying executive check-in times, battery levels, active signal strengths, and current queue processing speeds.
* **Compliance Lock Status:** A status widget confirming that the operational time gate is active and that all outreach tools are locked outside of RBI-permitted hours (08:00 to 19:00).

---

## 8. RECONCILIATION & CASH TRANSIT RULES

To prevent fraud and maintain strict accounting controls, Branch Managers must enforce a rigorous reconciliation and cash transit policy.

```
┌─────────────────────────────────────────────────────────────┐
│                   CASH TRANSIT LIFECYCLE                    │
├───────────────┬─────────────────────────────────────────────┤
│ STEP 1        │ Field Executive collects cash & signs receipt│
├───────────────┼─────────────────────────────────────────────┤
│ STEP 2        │ Receipt details log immediately via app     │
├───────────────┼─────────────────────────────────────────────┤
│ STEP 3        │ Funds are transported securely to branch    │
├───────────────┼─────────────────────────────────────────────┤
│ STEP 4        │ Manager verifies cash & signs bank deposit  │
└───────────────┴─────────────────────────────────────────────┘
```

### 8.1 Executing Daily Cash Reconciliation
1. At the end of the operational day, navigate to **Performance & Roster Dashboard** -> **Reconciliation Desk**.
2. Select the active executive roster: e.g., `Field Team Alpha`.
3. The system displays a list of cash collection records submitted via mobile applications.
4. Physical Cash Count: Manually count the cash turned in by the executive, confirming the totals match the digital collection logs.
5. If the counts match, click **Approve Reconciliation**.
6. The system generates a digital receipt, cryptographically signs the ledger, and saves the file to Cloudflare R2 object storage.
7. Prepare the physical cash for secure transit to the regional branch bank.

---

## 9. EXECUTIVE PERFORMANCE ANALYSIS

To optimize recovery rates, the Branch Manager conducts weekly performance audits of the field executive roster:

### 9.1 Executive Yield Rates and Performance Variables

| Executive Name | Active Caseload | Month-to-Date Collections | Geofence Success Rate | Average Visit Delay | Compliance Audit |
| :--- | :---: | :--- | :---: | :---: | :---: |
| **Rajesh Kumar** | 35 Cases | INR 450,000 | 100.00% (Passed) | 12 Minutes | Passed |
| **Amit Sharma** | 32 Cases | INR 380,000 | 98.40% (Passed) | 18 Minutes | Passed |
| **Pooja Patel** | 38 Cases | INR 410,000 | 97.20% (Passed) | 15 Minutes | Passed |
| **Sanjay Singh** | 30 Cases | INR 220,000 | 91.50% (Warning) | 28 Minutes | Passed |

---

## 10. LOCAL SETTLEMENT APPROVALS SOP (HAIRCUTS <= 20.00%)

To protect margins, debt write-offs and haircuts are managed through strict approval limits. Branch Managers are authorized to evaluate and sign off on standard settlement proposals where the haircut is less than or equal to 20.00%.

### 10.1 Reviewing and Approving Local Settlement Proposals
1. Navigate to **Settlement & Haircut Approvals** -> **Branch-Level Queue**.
2. Select an active proposal: e.g., `CASE-HDFC-MUM-10250`.
3. Review the borrower's total outstanding balance, payment history, collector visit notes, and the proposed write-off percentage (e.g., *14.50%*).
4. If the proposal is approved, click **Authorize Settlement**.
5. The system prompts for a secure, multi-factor authorization code.
6. Enter the OTP from your authenticator application to verify the transaction.
7. The system registers the approval, signs the agreement, saves the file to Cloudflare R2, and updates the case status to `Settled`.

> **CRITICAL ESCALATION RULE:** Any proposed settlement haircut exceeding 20.00% is blocked from Branch-level approval and must be escalated to the State Operations Manager via the portal's **Escalate to State** action.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: Branch-Level Approvals Workspace             |
| Capture the settlement evaluation page, showing the haircut range slider,   |
| verification fields, and the "Escalate to State" action button.             |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 11. GEOFENCE DISPUTES & COORDINATE OVERRIDES

When field executives are unable to complete standard check-ins due to physical access limitations or natural GPS drift, the manager must evaluate and resolve the discrepancy.

### 11.1 Processing Geofence Override Requests
1. Navigate to **Escalation & Geofence Center** -> **Override Workspace**.
2. Select an active geofence dispute: e.g., `DIS-MUM-90120`.
3. Review the agent's submission, location coordinates, check-in photo, and the geofence boundary coordinates.
4. If the agent's position is verified within a reasonable margin, click **Authorize GPS Override**.
5. The system prompts for a secure, multi-factor authorization code.
6. Enter the OTP from your authenticator application to verify the override.
7. The system registers the override, updates the check-in status, and saves a cryptographically signed receipt to the immutable audit trail.

---

## 12. OPERATIONAL KEY PERFORMANCE INDICATORS (KPIS)

Branch operations are tracked against key performance indicators (KPIs) to monitor compliance and recovery metrics.

```
+─────────────────────────────────────────────────────────────────────────────+
| LOCAL BRANCH PERFORMANCE TARGETS                                            |
|                                                                             |
| Branch Recovery Yield:     [ Target: > 75.00% ]                             |
| Geofence Success Rate:     [ Target: > 98.00% Passed ]                      |
| Reconciliation Drift:      [ Target: 0.00% Variance ]                       |
| Roster Sync Compliance:    [ Target: 100.00% On-Time ]                      |
+─────────────────────────────────────────────────────────────────────────────+
```

* **Branch Recovery Yield:** Maintain a branch-level recovery conversion rate of `> 75.00%`.
* **Geofence Success Rate:** 98.00% or more of checked debtor visits must pass GPS-geofenced verification.
* **Reconciliation Drift:** Zero cash discrepancy variance between digital collection logs and physical cash receipts.

---

## 13. GOVERNANCE CONTROLS & MONITORING SEALS

Compliance and security standards are enforced through automated controls built directly into the platform:

* **Sovereign Portfolio Separation:** Tenant banking data is isolated at the schema level, ensuring data privacy.
* **Operational Time Locks:** Enforces system-wide lockouts outside of RBI-permitted hours (08:00 to 19:00).
* **Closed-Loop Geofencing:** Verifies field coordinates against branch geofences during check-ins, logging mismatch alerts to the audit trail.

---

## 14. DAILY, WEEKLY, AND MONTHLY SOP CHECKLISTS

The Branch Manager must complete these checklists to verify performance and compliance:

### 14.1 Daily Checklist (Supervision & Reconciliation)
* [ ] **Dashboard Check:** Review the branch dashboard, checking agent rosters, active workloads, and check-in times.
* [ ] **Compliance Scan:** Confirm that zero contact attempts occurred outside of RBI-permitted hours.
* [ ] **Cash Reconciliation:** Verify and reconcile physical cash turned in by field executives.

### 14.2 Weekly Checklist (Audits & Balances)
* [ ] **Roster Audit:** Review branch staffing levels, workloads, and agent performance matrices.
* [ ] **Case Rebalancing:** Redistribute stagnated or unallocated cases to optimize coverage.
* [ ] **Geofence Audit:** Audit approved geofence overrides to verify that all overrides have matching justification logs.

### 14.3 Monthly Checklist (Reporting & Strategy)
* [ ] **Revenue Summary:** Compile and submit monthly branch performance reports to State leadership.
* [ ] **Target Adjustments:** Update local executive targets and case allocation parameters for the upcoming month.
* [ ] **RCA Audit:** Conduct a root-cause analysis on recurring geofence failures or SLA delays, logging CAPA tickets where needed.

---

## 15. BEST PRACTICES & LOCAL FIELD STRATEGIES

* **Enforce Least Privilege:** Restrict database access and high-exposure transaction scopes to authorized roles matching their daily responsibilities.
* **Monitor SLA Drifts Daily:** Keep track of branch escalation times to resolve local disputes before they breach SLA limits.
* **Verify Case Consent Records:** Periodically verify that data consent logs are active and comply with DPDP guidelines.

---

## 16. COMMON MISTAKES & OPERATIONAL PITFALLS

* **Approving Haircuts Without Verification:** Authorizing settlement haircuts without reviewing borrower history or collector logs can lead to audit warnings.
  * *Correction:* Always require a justification log for exceptional settlement proposals.
* **Overriding Geofences Automatically:** Approving geofence check-in disputes without checking agent coordinates can lead to compliance violations.
  * *Correction:* Cross-reference agent location histories before authorizing geofence overrides.
* **Allowing Out-of-Date App Connects:** Permitting agents to connect to APIs on older mobile versions introduces security and sync risks.
  * *Correction:* Require regular mobile app updates, prompting agents to install updates on startup.

---

## 17. TROUBLESHOOTING & TECHNICAL ESCALATIONS

### 17.1 Local Performance Data Sync Delays
* **Symptom:** Performance charts display blank or zero values for the branch.
* **Diagnostic Steps:** Check the database connection status and verify pgBouncer logs.
* **Resolution:** Ensure the connection string is valid and that database connection pools are not exhausted.

### 17.2 Mobile Check-In Telemetry Outages
* **Symptom:** Dashboard displays delayed check-in logs and map telemetry updates from field executives.
* **Diagnostic Steps:** Check Upstash Redis active queues and monitor worker container logs.
* **Resolution:** Scale Railway worker containers horizontally to handle sudden check-in volume spikes.

---

## 18. VALIDATION CHECKLIST & SYSTEM SMOKE TESTING

Before promoting configuration updates or target adjustments to the production environment, verify system stability against this checklist:

* [ ] **Database Connection:** Verify that the platform connects to production database pools using pgBouncer endpoints.
* [ ] **Queue Integrity:** Confirm that background task queues are online and accepting BullMQ assignments.
* [ ] **Access Controls:** Verify that user roles match the approved RBAC matrix and that no administrative secrets are exposed in client logs.
* [ ] **WAF Security Active:** Confirm that Cloudflare Web Application Firewall (WAF) rules are active and blocking unauthorized requests.

---

## 19. FAQ SECTION

#### Q1: Can a Branch Manager approve a settlement haircut of 25.00%?
No. Branch Managers are restricted to approving haircuts up to 20.00%. Any proposal exceeding 20.00% must be escalated to the State Operations Manager for review.

#### Q2: What happens if an agent consistently fails GPS-geofenced check-ins?
The system flags the branch and logs the coordinate mismatch alerts to the audit trail. The Branch Manager must review the agent's device configuration, signal strength, and field performance.

#### Q3: How are borrower consent revocations handled at the Branch level?
When a borrower revokes data processing consent, the system automatically logs the revocation, flags the associated case, masks all borrower PII, and pauses active outreach tasks.

---

## 20. GLOSSARY & REFERENCES

### 20.1 Glossary of Terms
* **BRC:** Branch Recovery Coefficient. Tracks collected value against monthly branch target allocations.
* **SLA:** Service Level Agreement. Predefined targets for response and resolution times.
* **WAF:** Web Application Firewall. Filters, monitors, and blocks malicious HTTP traffic to protect web applications.
* **pgBouncer:** A lightweight connection pooler for PostgreSQL that helps manage large volumes of serverless connections.
* **CAPA:** Corrective and Preventive Action. A structured process used to resolve and prevent the recurrence of non-conformities.

### 20.2 Regulatory & System References
1. **Reserve Bank of India (RBI):** Directions on Fair Practices Code and Debt Collection Standards.
2. **Digital Personal Data Protection Act, 2023:** Act No. 26 of 2023, Government of India.
3. **ISO 27001:2022:** Guidelines for Data Privacy and System Access Security.
4. **Cloudflare WAF Documentation:** Guide for configuring edge web application firewalls and DDoS protection rules.

---

## 21. APPENDIX

### 21.1 Cash Reconciliation Record Log Template
When physical cash collection is verified, the manager must log the details using the following structured template:

```
CASH RECONCILIATION RECORD LOG:
Record ID:      REC-EDROS-2026-0240
Date Logged:    2026-07-15 03:20:00 UTC
Branch Office:  Mumbai Central Branch (BR-MUM-001)
Executive Name: Rajesh Kumar (EMP-MUM-024)
Cash Amount:    INR 45,000 (Forty-Five Thousand Only)
Discrepancy:    None (Perfect Variance)
Audit Status:   RECONCILED & CLOSED (Logged to audit ledger)
```

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
