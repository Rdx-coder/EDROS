# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-OPS-SMM-003
## VERSION: 1.0.0
## CLASSIFICATION: INTERNAL ONLY (LEVEL 2 - OPERATIONAL STAFF)

---

# DOCUMENT 3: STATE OPERATIONS MANAGER OPERATIONS MANUAL

```
================================================================================
                 S T A T E   O P E R A T I O N S   M A N A G E R
                             O P E R A T I O N S   M A N U A L
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Chief Operations Officer (COO)
Co-Authors:   Director of Regional Recovery, Lead Compliance Auditor
Reviewer:     Chief Compliance Officer (CCO), National Head of Recovery Operations
Approver:     Chief Technology Officer & Operations Control Board
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline issue of the State Operations Manager Operations Manual for EDROS v1.0.0. | Chief Operations Officer | CTO & Operations Control Board |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [APPLICABLE STANDARDS & COMPLIANCE BOUNDARIES](#2-applicable-standards--compliance-boundaries)
3. [DEFINITIONS](#3-definitions)
4. [SYSTEM OVERVIEW & STATE MANAGER PORTAL](#4-system-overview--state-manager-portal)
5. [NAVIGATION & OPERATION FLOW](#5-navigation--operation-flow)
6. [REGIONAL MONITORING & BRANCH NETWORKS](#6-regional-monitoring--branch-networks)
7. [STATE PERFORMANCE DASHBOARD & DAILY METRICS](#7-state-performance-dashboard--daily-metrics)
8. [STATE REVENUE REPORTING & CASH FLOWS](#8-state-revenue-reporting--cash-flows)
9. [RECOVERY PERFORMANCE ANALYSIS BY REGION](#9-recovery-performance-analysis-by-region)
10. [SETTLEMENT APPROVALS & HAIRCUT LIMITS SOP](#10-settlement-approvals--haircut-limits-sop)
11. [STATE ESCALATION MANAGEMENT & DISPUTE RESOLUTION](#11-state-escalation-management--dispute-resolution)
12. [OPERATIONAL KEY PERFORMANCE INDICATORS (KPIS)](#12-operational-key-performance-indicators-kpis)
13. [GOVERNANCE CONTROLS & MONITORING SEALS](#13-governance-controls--monitoring-seals)
14. [DAILY, WEEKLY, AND MONTHLY SOP CHECKLISTS](#14-daily-weekly-and-monthly-sop-checklists)
15. [BEST PRACTICES & STATE-LEVEL OPERATIONAL STRATEGIES](#15-best-practices--state-level-operational-strategies)
16. [COMMON MISTAKES & OPERATIONAL PITFALLS](#16-common-mistakes--operational-pitfalls)
17. [TROUBLESHOOTING & SYSTEM ESCALATIONS](#17-troubleshooting--system-escalations)
18. [VALIDATION CHECKLIST & SYSTEM SMOKE TESTING](#18-validation-checklist--system-smoke-testing)
19. [FAQ SECTION](#19-faq-section)
20. [GLOSSARY & REFERENCES](#20-glossary--references)
21. [APPENDIX](#21-appendix)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
This operations manual establishes the definitive procedural framework and standard operating guidelines for the State Operations Manager (SMM) within the Enterprise Debt Recovery Operating System (EDROS). This document provides step-by-step instructions for regional branch network administration, state-level performance monitoring, local compliance verification, resource redistribution, and the evaluation of regional settlement escalations.

### 1.2 Scope
This manual governs all administrative, compliance, and analytical workflows exposed within the `State Manager Portal` of EDROS, including:
* **Regional Performance Auditing:** Monitoring regional clusters, branch offices, and team allocations within the designated state boundaries.
* **Standard Settlement Approvals:** Evaluating proposed debt write-offs and settlement haircuts within the 20.00% to 30.00% threshold.
* **State-Level Operational Intelligence:** Analyzing collection yields, branch target trends, conversion ratios, and field executive coverage.
* **Compliance Oversight:** Verifying local outreach activities against DPDP Act regulations, Fair Practices Code (FPC) rules, and regional contact policies.

### 1.3 Target Audience
This operations manual is written for:
* **State Operations Managers (SMMs)** and Assistant State Directors responsible for coordinating debt recovery operations within a specific state.
* **National Heads of Recovery** evaluating state performance matrices, compliance audit trends, and resource constraints.
* **Regional Managers and Branch Heads** seeking to align branch activities with state operational targets and SLA guidelines.
* **Internal Compliance Auditors** verifying that state-level outreach policies conform to legal and regulatory guidelines.

---

## 2. APPLICABLE STANDARDS & COMPLIANCE BOUNDARIES

The State Operations Manager works within strict legal and financial boundaries. All regional strategies and outreach plans must conform to:

```
┌─────────────────────────────────────────────────────────────┐
│                 COMPLIANCE CONTROL RING                     │
├───────────────┬─────────────────────────────────────────────┤
│ RBI FPC       │ Fair Practices Code for Debt Collectors     │
├───────────────┼─────────────────────────────────────────────┤
│ DPDP Act      │ Digital Personal Data Protection Act (2023) │
├───────────────┼─────────────────────────────────────────────┤
│ ISO 27001     │ Data Privacy and System Access Standards    │
├───────────────┼─────────────────────────────────────────────┤
│ SLA Targets   │ Service Level Agreement Escalation Metrics  │
└───────────────┴─────────────────────────────────────────────┘
```

> **CRITICAL COMPLIANCE NOTICE:** State Operations Managers are legally responsible for enforcing outreach boundaries within their state. Contact attempts outside of RBI-permitted hours (08:00 to 19:00) or at unassigned coordinates will result in immediate system lockout and disciplinary action.

---

## 3. DEFINITIONS

* **State Recovery Coefficient (SRC):** A composite rating calculated by dividing the state's total collected value by the active month-to-date target allocation.
* **State-Level Haircut Margin:** The permissible range (20.00% to 30.00%) where the State Operations Manager has sole authority to approve debt settlement haircuts.
* **SLA Resolution Window:** The maximum time allocated to resolve a regional escalation (e.g., geofence dispute, coordinate mismatch) before it is escalated to the National Head.
* **Branch Geofence Radius:** The virtual boundary assigned to a physical branch office, within which field executives must verify their check-in locations.
* **Port-to-Port Cash Transit:** The sequence of secure steps tracking collected cash from the debtor's premises to final verification at the regional branch bank.

---

## 4. SYSTEM OVERVIEW & STATE MANAGER PORTAL

The State Manager Portal provides a dedicated administrative dashboard for managing regional operations within a designated state boundary. Integrating real-time metrics from regional offices, team rosters, and field operations, the portal allows the State Operations Manager to monitor, balance, and audit collection activities.

### 4.1 Platform Data Streams & Storage Integration
The portal is fully integrated with the core EDROS platform architecture:
* **Neon PostgreSQL Master Instance:** Pulls transaction records, active rosters, branch targets, and case lists specific to the state boundary.
* **Upstash Redis Cluster:** Processes real-time field check-in coordinates, active session keys, and queue processing statuses.
* **Cloudflare R2 Object Storage:** Archives signed state-level settlement agreements, watermarked demand notices, and compliance logs.

---

## 5. NAVIGATION & OPERATION FLOW

The State Manager Portal is organized around five main functional areas designed to ensure quick navigation and logical separation of duties:

```
[ State Manager Portal ]
          │
          ├──► [ Regional Node Command ] (Regional Clusters, Branch Offices, Field Coverage)
          │
          ├──► [ State Performance Desk ] (SMM Dashboard, Active Collection Yields, Targets)
          │
          ├──► [ Settlement Approvals ] (State-Level Haircuts, Multi-Sign Off Workspace)
          │
          └──► [ Regional Escalation Hub ] (Geofence Disputes, Case Arbitration, SLA Tracking)
```

---

## 6. REGIONAL MONITORING & BRANCH NETWORKS

The Regional Node Command interface allows the State Operations Manager to oversee and manage regional branches and field forces.

### 6.1 Regional Geographic Allocation & Management
* **Regional Cluster Panel:** An interactive list of all registered regional administrative nodes within the state (e.g., *Mumbai Suburban, Pune, Nagpur, Nashik*).
* **Branch Status Breakdown:** Displays physical branch offices within each region, showing active case volumes, target completion rates, and active personnel counts.
* **Dynamic Personnel Redistribution:** SMMs can dynamically reassign caseload pools or transfer field agents between branches in response to sudden volume increases or regional resource constraints.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: Regional Node Command Desk                    |
| Capture the Regional Command UI, showing active branch metrics, agent       |
| allocation sliders, and regional case density indicators.                   |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 7. STATE PERFORMANCE DASHBOARD & DAILY METRICS

The SMM Dashboard provides a real-time overview of the state's recovery operations and compliance levels:

```
+─────────────────────────────────────────────────────────────────────────────+
| STATE OPERATIONS MANAGER REAL-TIME DASHBOARD                                |
|                                                                             |
| MTD Collected Volume: [ INR 18,421,500 ] - Progress to Target: 78.4%        |
| Active Caseload:      [ 4,820 Cases ]    - Closed Month-to-Date: 1,420      |
| Field Coverage Ratio: [ 94.20% ]         - Checked-In Agents: 310           |
| Active Escalations:   [ 4 Open Cases ]   - Compliance Infractions: 0        |
+─────────────────────────────────────────────────────────────────────────────+
```

### 7.1 Real-Time Analytics Widgets
* **State Yield Progress Curve:** A line chart plotting cumulative daily collection yields against the monthly target trajectory.
* **Branch Comparison Matrix:** A horizontal bar chart comparing collection performance and target conversion rates across all physical branches.
* **Field Check-In Stream:** A live feed displaying field executive check-ins, highlighting successful GPS-geofenced visits and flagging any coordinate anomalies.

---

## 8. STATE REVENUE REPORTING & CASH FLOWS

SMMs compile, verify, and submit detailed state-level revenue reports and cash transit sheets to National leadership and client bank audit teams.

### 8.1 Generating and Exporting State Revenue Summaries
1. Navigate to **State Performance Desk** -> **Reports Console** -> **State Revenue**.
2. Select the parent portfolio: e.g., `HDFC Bank Retail Portfolios`.
3. Choose the reporting period and select the target regions.
4. Click **Aggregate Revenue Data**. The system processes transaction databases and compiles the performance analytics.
5. Review the generated tables, confirming that all collected cash matches verified bank transit receipts.
6. Click **Generate Watermarked PDF**. The file is generated, cryptographically signed, and saved to secure Cloudflare R2 storage.

---

## 9. RECOVERY PERFORMANCE ANALYSIS BY REGION

To optimize performance and resource allocation, the State Operations Manager audits key metrics across active regions on a weekly basis:

### 9.1 Regional Collection Yields and Performance Variables

| Regional Node | Active Branches | Month-to-Date Collections | Conversion Rate | GPS Mismatch Incidents | Agent Roster Count |
| :--- | :---: | :--- | :---: | :---: | :---: |
| **Mumbai Suburban** | 8 Branches | INR 8,450,000 | 84.12% | 1 Incident | 120 Agents |
| **Pune Region** | 5 Branches | INR 4,920,000 | 79.85% | 0 Incidents | 85 Agents |
| **Nagpur Node** | 4 Branches | INR 2,851,500 | 76.40% | 3 Incidents | 55 Agents |
| **Nashik Cluster** | 3 Branches | INR 2,200,000 | 71.18% | 2 Incidents | 50 Agents |

---

## 10. SETTLEMENT APPROVALS & HAIRCUT LIMITS SOP

To protect margins, settlement haircuts are managed through strict approval limits. SMMs have sole authority to sign off on standard settlement proposals within the 20.00% to 30.00% threshold.

```
┌─────────────────────────────────────────────────────────────┐
│                 SETTLEMENT APPROVAL FLOW                    │
├───────────────┬─────────────────────────────────────────────┤
│ STEP 1        │ Branch Manager proposes haircut (20% - 30%) │
├───────────────┼─────────────────────────────────────────────┤
│ STEP 2        │ System locks case and routes to SMM queue   │
├───────────────┼─────────────────────────────────────────────┤
│ STEP 3        │ SMM reviews payment history & collector logs│
├───────────────┼─────────────────────────────────────────────┤
│ STEP 4        │ SMM approves with secure OTP sign-off       │
└───────────────┴─────────────────────────────────────────────┘
```

### 10.1 Reviewing and Approving Standard Settlement Proposals
1. Navigate to **Settlement Approvals** -> **State-Level Queue**.
2. Select an active proposal: e.g., `CASE-HDFC-PUN-40120`.
3. Review the borrower's total outstanding balance, payment history, collector visit notes, and the proposed write-off percentage (e.g., *24.50%*).
4. If the proposal is approved, click **Authorize Settlement**.
5. The system prompts for a secure, multi-factor authorization code.
6. Enter the OTP from your authenticator application to verify the transaction.
7. The system registers the approval, signs the agreement, saves the file to Cloudflare R2, and updates the case status to `Settled`.

> **CRITICAL ESCALATION RULE:** Any proposed settlement haircut exceeding 30.00% is blocked from State-level approval and must be escalated to the National Head via the portal's **Escalate to National** action.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: State-Level Approvals Workspace               |
| Capture the settlement evaluation page, showing the haircut range slider,    |
| verification fields, and the "Escalate to National" action button.          |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 11. STATE ESCALATION MANAGEMENT & DISPUTE RESOLUTION

When operational disputes or compliance warnings occur within branches, they are escalated to the Regional Escalation Hub for resolution.

### 11.1 Standard Arbitration & Resolution Paths
* **GPS Coordinate Discrepancies:** If a field agent is unable to check in due to physical access limits or natural GPS drift, the branch manager logs an override request. The SMM reviews the agent's location history and logs a verified override.
* **Outreach Contact Complaints:** Reviews and resolves borrower contact complaints, checking agent visit logs to verify compliance with Fair Practices Code (FPC) rules.
* **Unallocated Case Disputes:** Resolves disputes where cases are unassigned or assigned incorrectly, reallocating cases based on agent performance metrics.

---

## 12. OPERATIONAL KEY PERFORMANCE INDICATORS (KPIS)

State operations are tracked against key performance indicators (KPIs) to monitor compliance and recovery metrics.

```
+─────────────────────────────────────────────────────────────────────────────+
| STATE OPERATIONAL PERFORMANCE TARGETS                                       |
|                                                                             |
| State Recovery yield:      [ Target: > 80.00% ]                             |
| Outreach Policy Auditing:  [ Target: 100.00% Correct ]                      |
| Dispute Resolution SLA:    [ Target: < 4 Hours ]                            |
| Roster Sync Coverage:      [ Target: > 95.00% ]                             |
+─────────────────────────────────────────────────────────────────────────────+
```

* **State Recovery Yield:** Maintain a state-level target recovery conversion rate of `> 80.00%`.
* **Outreach Policy Auditing:** Confirm that 100% of outreach campaigns comply with RBI contact rules.
* **Dispute Resolution SLA:** Resolve regional escalations and geofence disputes within 4 hours of logging.

---

## 13. GOVERNANCE CONTROLS & MONITORING SEALS

Governance and security standards are enforced through automated controls built directly into the platform:

* **Sovereign Portfolio Separation:** Tenant banking data is isolated at the schema level, ensuring data privacy.
* **Operational Time Locks:** Enforces system-wide lockouts outside of RBI-permitted hours (08:00 to 19:00).
* **Closed-Loop Geofencing:** Verifies field coordinates against branch geofences during check-ins, logging mismatch alerts to the audit trail.

---

## 14. DAILY, WEEKLY, AND MONTHLY SOP CHECKLISTS

The State Operations Manager must complete these checklists to verify performance and compliance:

### 14.1 Daily Checklist (Monitoring & Performance)
* [ ] **Dashboard Check:** Review the SMM dashboard, checking regional collection metrics and active caseloads.
* [ ] **Roster Sync Review:** Confirm that physical branch staffing levels and checked-in executive counts are synchronized.
* [ ] **Escalation Scan:** Resolve open geofence check-in disputes and coordinate discrepancies.

### 14.2 Weekly Checklist (Audits & Allocations)
* [ ] **Case Rebalancing:** Review branch workloads and transfer cases between branches to optimize coverage.
* [ ] **Settlement Audit:** Review approved settlement write-offs, verifying that all exceptions have matching justification logs.
* [ ] **Compliance Audit:** Confirm that zero contact attempts occurred outside of RBI-permitted hours.

### 14.3 Monthly Checklist (Reporting & Planning)
* [ ] **Revenue Compilation:** Compile, verify, and submit monthly State Revenue Summary reports.
* [ ] **Target Adjustments:** Update regional branch targets and case allocation parameters for the upcoming month.
* [ ] **RCA Audit:** Conduct a root-cause analysis on recurring geofence mismatches or SLA delays, logging CAPA tickets where needed.

---

## 15. BEST PRACTICES & STATE-LEVEL OPERATIONAL STRATEGIES

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

### 17.1 Regional Revenue Data Sync Delays
* **Symptom:** Performance charts display blank or zero values for active regions.
* **Diagnostic Steps:** Check the database connection status and verify pgBouncer logs.
* **Resolution:** Ensure the connection string is valid and that database connection pools are not exhausted.

### 17.2 Mobile Check-In Telemetry Outages
* **Symptom:** SMM dashboard displays delayed check-in logs and map telemetry updates from field executives.
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

#### Q1: Can a State Operations Manager approve a settlement haircut of 35.00%?
No. SMMs are restricted to approving haircuts between 20.00% and 30.00%. Any proposal exceeding 30.00% must be escalated to the National Head of Recovery for review.

#### Q2: What happens if an agent consistently fails GPS-geofenced check-ins?
The system flags the branch and logs the coordinate mismatch alerts to the audit trail. The SMM receives an automated alert and must coordinate with the branch manager to review the agent's device configuration and field performance.

#### Q3: How are borrower consent revocations handled at the State level?
When a borrower revokes data processing consent, the system automatically logs the revocation, flags the associated case, masks all borrower PII, and pauses active outreach tasks.

---

## 20. GLOSSARY & REFERENCES

### 20.1 Glossary of Terms
* **SRC:** State Recovery Coefficient. Tracks collected value against monthly target allocations.
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

### 21.1 Regional Dispute Record Log Template
When regional disputes are escalated to the SMM, the coordinator must log the details using the following structured template:

```
REGIONAL DISPUTE RECORD LOG:
Dispute ID:     DIS-EDROS-2026-0120
Date Logged:    2026-07-15 03:10:00 UTC
Regional Node:  Pune Region (REG-PUN-01)
Branch Office:  Pune Central Branch (BR-PUN-002)
Dispute Type:   GPS Geofence Override Request
Description:    Agent unable to check in due to physical access limits and GPS drift.
Arbitration:    Reviewed agent location history, verified coordinates, and authorized override.
Audit Status:   RESOLVED & CLOSED (Logged to audit ledger)
```

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
