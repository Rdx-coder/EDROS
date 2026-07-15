# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-OPS-ROM-005
## VERSION: 1.0.0
## CLASSIFICATION: INTERNAL ONLY (LEVEL 2 - OPERATIONAL STAFF)

---

# DOCUMENT 5: REGIONAL OPERATIONS MANAGER MANUAL

```
================================================================================
               R E G I O N A L   O P E R A T I O N S   M A N A G E R
                                 M A N U A L
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Chief Operations Officer (COO)
Co-Authors:   Director of Regional Recovery, Lead Compliance Auditor
Reviewer:     Chief Compliance Officer (CCO), State Operations Manager
Approver:     Chief Technology Officer & Operations Control Board
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline issue of the Regional Operations Manager Manual for EDROS v1.0.0. | Chief Operations Officer | CTO & Operations Control Board |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [APPLICABLE STANDARDS & COMPLIANCE BOUNDARIES](#2-applicable-standards--compliance-boundaries)
3. [DEFINITIONS](#3-definitions)
4. [SYSTEM OVERVIEW & REGIONAL PORTAL](#4-system-overview--regional-portal)
5. [NAVIGATION & OPERATION FLOW](#5-navigation--operation-flow)
6. [BRANCH PERFORMANCE AUDITING & COMPLIANCE OVERVIEW](#6-branch-performance-auditing--compliance-overview)
7. [REGIONAL PERFORMANCE DASHBOARD & METRICS](#7-regional-performance-dashboard--metrics)
8. [RECONCILIATION AUDITING & INTER-BRANCH CASH CONSOLIDATION](#8-reconciliation-auditing--inter-branch-cash-consolidation)
9. [REGIONAL PORTFOLIO DISTRIBUTION & RESOURCE BALANCING](#9-regional-portfolio-distribution--resource-balancing)
10. [SETTLEMENT REVIEW SOP & REGIONAL HAIRCUT LIMITS](#10-settlement-review-sop--regional-haircut-limits)
11. [GEOFENCE DISPUTES & MULTI-BRANCH ESCALATIONS](#11-geofence-disputes--multi-branch-escalations)
12. [OPERATIONAL KEY PERFORMANCE INDICATORS (KPIS)](#12-operational-key-performance-indicators-kpis)
13. [GOVERNANCE CONTROLS & MONITORING SEALS](#13-governance-controls--monitoring-seals)
14. [DAILY, WEEKLY, AND MONTHLY SOP CHECKLISTS](#14-daily-weekly-and-monthly-sop-checklists)
15. [BEST PRACTICES & REGIONAL-LEVEL OPERATIONAL STRATEGIES](#15-best-practices--regional-level-operational-strategies)
16. [COMMON MISTAKES & OPERATIONAL PITFALLS](#16-common-mistakes--operational-pitfalls)
17. [TROUBLESHOOTING & SYSTEM ESCALATIONS](#17-troubleshooting--system-escalations)
18. [VALIDATION CHECKLIST & SYSTEM SMOKE TESTING](#18-validation-checklist--system-smoke-testing)
19. [FAQ SECTION](#19-faq-section)
20. [GLOSSARY & REFERENCES](#20-glossary--references)
21. [APPENDIX](#21-appendix)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
This operations manual establishes the definitive procedural framework and standard operating guidelines for the Regional Operations Manager (ROM) within the Enterprise Debt Recovery Operating System (EDROS). This document provides detailed, step-by-step instructions for multi-branch coordination, regional portfolio allocation, compliance enforcement across branch networks, cash transit auditing, and intermediate settlement evaluations.

### 1.2 Scope
This manual governs all administrative, supervisory, and analytical workflows exposed within the `Regional Manager Portal` of EDROS, including:
* **Multi-Branch Operations Auditing:** Monitoring local branch metrics, recovery coefficients, and agent workloads within the regional cluster boundaries.
* **Regional Settlement Approvals:** Evaluating proposed debt write-offs and settlement haircuts within the 20.01% to 25.00% threshold.
* **Inter-Branch Cash Consolidation:** Verifying physical transit deposit records against branch collection ledgers on a weekly and monthly basis.
* **Resource and Portfolio Balancing:** Transferring portfolios and reallocating accounts between branches to optimize collection velocities.
* **Geofence and Override Arbitration:** Resolving escalated GPS geofence disputes from physical branches.

### 1.3 Target Audience
This operations manual is written for:
* **Regional Operations Managers (ROMs)** responsible for directing recovery activities across a defined cluster of physical branches.
* **State Operations Managers (SMMs)** reviewing regional yields, branch performance trends, and compliance metrics.
* **Branch Managers (BMMs)** seeking to align branch workflows with regional targets and collection guidelines.
* **Internal and External Auditors** verifying compliance levels across physical branch networks.

---

## 2. APPLICABLE STANDARDS & COMPLIANCE BOUNDARIES

The Regional Operations Manager operates at a key supervisory level. All regional programs, branch allocations, and outreach initiatives must align with:

```
┌─────────────────────────────────────────────────────────────┐
│                 COMPLIANCE CONTROL RING                     │
├───────────────┬─────────────────────────────────────────────┤
│ RBI FPC       │ Fair Practices Code for Lenders             │
├───────────────┼─────────────────────────────────────────────┤
│ DPDP Act      │ Digital Personal Data Protection Act (2023) │
├───────────────┼─────────────────────────────────────────────┤
│ ISO 27001     │ Data Privacy and Information Security       │
├───────────────┼─────────────────────────────────────────────┤
│ SLA Targets   │ Inter-Branch Escalation & Resolution Metrics│
└───────────────┴─────────────────────────────────────────────┘
```

> **CRITICAL COMPLIANCE NOTICE:** Regional Managers are legally responsible for auditing outreach hours across all physical branches in their region. Any contact attempts executed by physical branches outside of RBI-permitted hours (08:00 to 19:00) will result in immediate branch-level suspensions and system-wide audits.

---

## 3. DEFINITIONS

* **Regional Recovery Coefficient (RRC):** The composite efficiency rating calculated by dividing the region's actual consolidated collected cash value by the monthly regional target allocation.
* **Regional Haircut Limit:** The permissible range (20.01% to 25.00%) where the Regional Operations Manager has direct authority to approve debt settlement proposals.
* **Inter-Branch Portfolio Balancing:** The process of shifting unallocated or stalled portfolios from underperforming branches to high-efficiency branch networks.
* **Geofence Radius Margin:** The virtual GPS perimeter (100 meters) surrounding a debtor's check-in coordinates, audited weekly at the regional level.
* **Cash Transit Security Seal:** The cryptographically verified barcode sequence tracking physical cash bags from local branches to the regional vault.

---

## 4. SYSTEM OVERVIEW & REGIONAL PORTAL

The Regional Manager Portal provides a secure, consolidated dashboard for supervising multiple branch offices within a designated region. It compiles real-time telemetry from local branch dashboards, field check-ins, cash ledgers, and active settlement queues, allowing the Regional Operations Manager to manage regional operations effectively.

### 4.1 Platform Data Streams & Storage Integration
The portal is fully integrated with the core EDROS platform architecture:
* **Neon PostgreSQL Master Instance:** Pulls regional branch rosters, target assignments, historical collections, and security logs.
* **Upstash Redis Cluster:** Processes live coordinate arrays, regional rate limits, active supervisor sessions, and geofence verification queues.
* **Cloudflare R2 Object Storage:** Archives signed regional settlement agreements, branch deposit receipts, and audited visit photos.

---

## 5. NAVIGATION & OPERATION FLOW

The Regional Manager Portal features a clean, tabbed navigation console designed to keep critical indicators and strategic workspaces quickly accessible:

```
[ Regional Manager Portal ]
          │
          ├──► [ Branch Network Command ] (Branch Nodes, Agent Allocations, Roster Audits)
          │
          ├──► [ Regional Performance Desk ] (ROM Dashboard, Collected Yields, Target Tracking)
          │
          ├──► [ Inter-Branch Reconciliation ] (Consolidated Cash Ledgers, Deposit Verification)
          │
          ├──► [ Regional Settlement Approvals ] (ROM-Tier Haircuts, Endorsement Workspace)
          │
          └──► [ Regional Escalation Center ] (Geofence Overrides, Dispute Arbitration)
```

---

## 6. BRANCH PERFORMANCE AUDITING & COMPLIANCE OVERVIEW

The Branch Network Command interface allows the ROM to manage and audit physical branch operations:

* **Active Branch Monitoring:** Displays real-time status indicators for all physical branches, including active caseloads, target achievements, and personnel counts.
* **Compliance Violation Auditing:** Automatically flags any out-of-bounds agent visits or contact attempts logged outside of RBI hours (08:00 to 19:00).
* **Personnel Sync Inspections:** Verifies that physical branch staffing levels and active check-in counts match regional database profiles.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: Branch Network Command Interface             |
| Capture the Branch Network UI, showing active branch status tables,        |
| target progress widgets, and compliance violation alerts.                   |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 7. REGIONAL PERFORMANCE DASHBOARD & METRICS

The ROM Dashboard provides a real-time overview of the region's recovery operations and compliance levels:

```
+─────────────────────────────────────────────────────────────────────────────+
| REGIONAL OPERATIONS MANAGER REAL-TIME DASHBOARD                             |
|                                                                             |
| MTD Collected Volume: [ INR 18,421,500 ] - Progress to Target: 78.4%        |
| Consolidated Caseload:[ 4,820 Cases ]    - Closed Month-to-Date: 1,420      |
| Field Coverage Ratio: [ 94.20% ]         - Checked-In Agents: 310           |
| Active Escalations:   [ 4 Open Cases ]   - Compliance Infractions: 0        |
+─────────────────────────────────────────────────────────────────────────────+
```

### 7.1 Real-Time Analytics Widgets
* **Regional Yield Progress Curve:** A line chart plotting cumulative daily collection yields against the monthly regional target trajectory.
* **Branch Comparison Matrix:** A horizontal bar chart comparing collection performance and target conversion rates across all physical branches.
* **Field Check-In Stream:** A live feed displaying field executive check-ins, highlighting successful GPS-geofenced visits and flagging any coordinate anomalies.

---

## 8. RECONCILIATION AUDITING & INTER-BRANCH CASH CONSOLIDATION

ROMs must conduct weekly audits of branch cash transit sheets and bank deposit records:

### 8.1 Performing Weekly Cash Consolidation Audits
1. Navigate to **Inter-Branch Reconciliation** -> **Consolidation Desk**.
2. Select the target physical branch: e.g., `Pune Central Branch (BR-PUN-002)`.
3. The system displays a list of physical cash collections and completed bank deposits for the week.
4. Cross-reference physical deposit receipts against digital transaction logs, confirming zero variance.
5. If verified, click **Approve Branch Consolidation**.
6. The system signs the consolidated ledger, updates the branch status, and saves a cryptographically signed receipt to Cloudflare R2 object storage.

---

## 9. REGIONAL PORTFOLIO DISTRIBUTION & RESOURCE BALANCING

To optimize recovery rates, ROMs can dynamically redistribute portfolios or reallocate accounts between physical branches:

* **Portfolio Redistribution Panel:** SMMs and ROMs can transfer active case pools from capacity-constrained branches to branches with active capacity.
* **Roster Balancing Controls:** Reassign field agent teams or allocate additional caseloads based on active branch conversion metrics.
* **Stagnancy Alerts:** Automatically flags cases with zero visits logged for 14 days, prompting the ROM to initiate inter-branch rebalancing.

---

## 10. SETTLEMENT REVIEW SOP & REGIONAL HAIRCUT LIMITS

To protect margins, debt write-offs and haircuts are managed through strict approval limits. ROMs have sole authority to sign off on standard settlement proposals within the 20.01% to 25.00% threshold.

```
┌─────────────────────────────────────────────────────────────┐
│                 SETTLEMENT APPROVAL FLOW                    │
├───────────────┬─────────────────────────────────────────────┤
│ STEP 1        │ Branch Manager proposes haircut (20% - 25%) │
├───────────────┼─────────────────────────────────────────────┤
│ STEP 2        │ System locks case and routes to ROM queue   │
├───────────────┼─────────────────────────────────────────────┤
│ STEP 3        │ ROM reviews payment history & collector logs │
├───────────────┼─────────────────────────────────────────────┤
│ STEP 4        │ ROM approves with secure OTP sign-off       │
└───────────────┴─────────────────────────────────────────────┘
```

### 10.1 Reviewing and Approving Regional Settlement Proposals
1. Navigate to **Regional Settlement Approvals** -> **Regional-Level Queue**.
2. Select an active proposal: e.g., `CASE-HDFC-PUN-40120`.
3. Review the borrower's total outstanding balance, payment history, collector visit notes, and the proposed write-off percentage (e.g., *22.50%*).
4. If the proposal is approved, click **Authorize Settlement**.
5. The system prompts for a secure, multi-factor authorization code.
6. Enter the OTP from your authenticator application to verify the transaction.
7. The system registers the approval, signs the agreement, saves the file to Cloudflare R2, and updates the case status to `Settled`.

> **CRITICAL ESCALATION RULE:** Any proposed settlement haircut exceeding 25.00% is blocked from Regional-level approval and must be escalated to the State Operations Manager via the portal's **Escalate to State** action.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: Regional-Level Approvals Workspace            |
| Capture the settlement evaluation page, showing the haircut range slider,    |
| verification fields, and the "Escalate to State" action button.             |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 11. GEOFENCE DISPUTES & MULTI-BRANCH ESCALATIONS

When physical branch managers log geofence override requests or when GPS disputes occur, ROMs must evaluate and resolve the discrepancy:

### 11.1 Processing Regional Geofence Override Escalations
1. Navigate to **Regional Escalation Center** -> **Geofence Overrides**.
2. Select an active geofence dispute: e.g., `DIS-ROM-30120`.
3. Review the agent's submission, physical visit location coordinates, check-in photo, and geofence coordinates.
4. If the agent's position is verified within a reasonable margin, click **Authorize GPS Override**.
5. Enter the OTP from your authenticator application to verify the override.
6. The system registers the override, updates the check-in status, and saves a cryptographically signed receipt to the immutable audit trail.

---

## 12. OPERATIONAL KEY PERFORMANCE INDICATORS (KPIS)

Regional operations are tracked against key performance indicators (KPIs) to monitor compliance and recovery metrics.

```
+─────────────────────────────────────────────────────────────────────────────+
| REGIONAL PERFORMANCE TARGETS                                                |
|                                                                             |
| Regional Recovery Yield:   [ Target: > 78.00% ]                             |
| Outreach Policy Auditing:  [ Target: 100.00% Correct ]                      |
| Dispute Resolution SLA:    [ Target: < 4 Hours ]                            |
| Branch Roster Coverage:    [ Target: > 95.00% ]                             |
+─────────────────────────────────────────────────────────────────────────────+
```

* **Regional Recovery Yield:** Maintain a regional-level recovery conversion rate of `> 78.00%`.
* **Outreach Policy Auditing:** Confirm that 100% of outreach campaigns comply with RBI contact rules.
* **Dispute Resolution SLA:** Resolve branch escalations and geofence disputes within 4 hours of logging.

---

## 13. GOVERNANCE CONTROLS & MONITORING SEALS

Governance and security standards are enforced through automated controls built directly into the platform:

* **Sovereign Portfolio Separation:** Tenant banking data is isolated at the schema level, ensuring data privacy.
* **Operational Time Locks:** Enforces system-wide lockouts outside of RBI-permitted hours (08:00 to 19:00).
* **Closed-Loop Geofencing:** Verifies field coordinates against branch geofences during check-ins, logging mismatch alerts to the audit trail.

---

## 14. DAILY, WEEKLY, AND MONTHLY SOP CHECKLISTS

The Regional Operations Manager must complete these checklists to verify performance and compliance:

### 14.1 Daily Checklist (Supervision & Monitoring)
* [ ] **Dashboard Check:** Review the ROM dashboard, checking branch metrics, active caseloads, and check-in times.
* [ ] **Escalation Scan:** Resolve open geofence check-in disputes and coordinate discrepancies.
* [ ] **Compliance Scan:** Confirm that zero contact attempts occurred outside of RBI-permitted hours.

### 14.2 Weekly Checklist (Audits & Balances)
* [ ] **Case Rebalancing:** Review branch workloads and transfer cases between branches to optimize coverage.
* [ ] **Cash Transit Audit:** Verify physical transit deposit records against branch collection ledgers, confirming zero variance.
* [ ] **Settlement Audit:** Review approved settlement write-offs, verifying that all exceptions have matching justification logs.

### 14.3 Monthly Checklist (Reporting & Strategy)
* [ ] **Revenue Compilation:** Compile, verify, and submit monthly Regional Revenue Summary reports to State leadership.
* [ ] **Target Adjustments:** Update local branch targets and case allocation parameters for the upcoming month.
* [ ] **RCA Audit:** Conduct a root-cause analysis on recurring geofence failures or SLA delays, logging CAPA tickets where needed.

---

## 15. BEST PRACTICES & REGIONAL-LEVEL OPERATIONAL STRATEGIES

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

## 17. TROUBLESHOOTING & SYSTEM ESCALATIONS

### 17.1 Regional Performance Data Sync Delays
* **Symptom:** Performance charts display blank or zero values for the region.
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

#### Q1: Can a Regional Operations Manager approve a settlement haircut of 28.00%?
No. ROMs are restricted to approving haircuts between 20.01% and 25.00%. Any proposal exceeding 25.00% must be escalated to the State Operations Manager for review.

#### Q2: What happens if an agent consistently fails GPS-geofenced check-ins?
The system flags the branch and logs the coordinate mismatch alerts to the audit trail. The ROM must review the agent's device configuration, signal strength, and field performance.

#### Q3: How are borrower consent revocations handled at the Regional level?
When a borrower revokes data processing consent, the system automatically logs the revocation, flags the associated case, masks all borrower PII, and pauses active outreach tasks.

---

## 20. GLOSSARY & REFERENCES

### 20.1 Glossary of Terms
* **RRC:** Regional Recovery Coefficient. Tracks collected value against monthly regional target allocations.
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

### 21.1 Regional Audit Record Log Template
When regional branch audits are completed, the manager must log the details using the following structured template:

```
REGIONAL AUDIT RECORD LOG:
Audit ID:       AUD-ROM-2026-0501
Date Logged:    2026-07-15 03:30:00 UTC
Regional Node:  Pune Region (REG-PUN-01)
Branch Audited: Pune Central Branch (BR-PUN-002)
Compliance:     100.00% Compliant (Zero RBI hour infractions)
Variance:       None (Perfect bank deposit ledger balance)
Audit Status:   AUDITED & PASSED (Logged to audit ledger)
```

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
