# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-OPS-TLM-006
## VERSION: 1.0.0
## CLASSIFICATION: INTERNAL ONLY (LEVEL 2 - OPERATIONAL STAFF)

---

# DOCUMENT 6: TEAM LEADER CASE ALLOCATION MANUAL

```
================================================================================
                    T E A M   L E A D E R   C A S E   A L L O C A T I O N
                                 M A N U A L
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Chief Operations Officer (COO)
Co-Authors:   Regional Recovery Director, Lead Systems Auditor
Reviewer:     Chief Compliance Officer (CCO), Branch Manager
Approver:     Chief Technology Officer & Operations Control Board
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline release of the Team Leader Case Allocation Manual for EDROS v1.0.0. | Chief Operations Officer | CTO & Operations Control Board |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [APPLICABLE STANDARDS & COMPLIANCE BOUNDARIES](#2-applicable-standards--compliance-boundaries)
3. [DEFINITIONS](#3-definitions)
4. [SYSTEM OVERVIEW & TEAM LEADER DESK](#4-system-overview--team-leader-desk)
5. [NAVIGATION & OPERATION FLOW](#5-navigation--operation-flow)
6. [DAILY CASE ALLOCATION & AGENT WORKLOAD BALANCING](#6-daily-case-allocation--agent-workload-balancing)
7. [REAL-TIME FIELD FORCE TRACKING & VISIT MONITORING](#7-real-time-field-force-tracking--visit-monitoring)
8. [DAILY CHECK-IN RECONCILIATION & RECOVERY LOGS](#8-daily-check-in-reconciliation--recovery-logs)
9. [EXECUTIVE YIELD PERFORMANCE ANALYSIS](#9-executive-yield-performance-analysis)
10. [SETTLEMENT PROPOSAL ENDORSEMENTS & REVIEW SOP](#10-settlement-proposal-endorsements--review-sop)
11. [GEOFENCE DISPUTE VERIFICATION & INITIAL TRIAGE](#11-geofence-dispute-verification--initial-triage)
12. [OPERATIONAL KEY PERFORMANCE INDICATORS (KPIS)](#12-operational-key-performance-indicators-kpis)
13. [GOVERNANCE CONTROLS & MONITORING SEALS](#13-governance-controls--monitoring-seals)
14. [DAILY, WEEKLY, AND MONTHLY SOP CHECKLISTS](#14-daily-weekly-and-monthly-sop-checklists)
15. [BEST PRACTICES & TEAM SUPERVISION STRATEGIES](#15-best-practices--team-supervision-strategies)
16. [COMMON MISTAKES & OPERATIONAL PITFALLS](#16-common-mistakes--operational-pitfalls)
17. [TROUBLESHOOTING & TECHNICAL ESCALATIONS](#17-troubleshooting--technical-escalations)
18. [VALIDATION CHECKLIST & SYSTEM SMOKE TESTING](#18-validation-checklist--system-smoke-testing)
19. [FAQ SECTION](#19-faq-section)
20. [GLOSSARY & REFERENCES](#20-glossary--references)
21. [APPENDIX](#21-appendix)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
This operations manual establishes the definitive procedural framework and standard operating guidelines for Team Leaders (TLs) within the Enterprise Debt Recovery Operating System (EDROS). This document provides detailed, step-by-step instructions for daily field-force allocations, real-time agent visit tracking, first-tier geofence dispute verification, settlement proposal reviews, and team performance metrics.

### 1.2 Scope
This manual governs all administrative and supervisory workflows exposed within the `Team Leader Desk` of EDROS, including:
* **Daily Case Allocation:** Reviewing pending branch accounts and distributing portfolios to field executives based on proximity and agent capacity.
* **Real-Time Field Force Monitoring:** Managing GPS location updates, check-in streams, visit delay parameters, and active executive statuses.
* **Settlement Endorsements:** Conducting first-tier verification of debtor settlement proposals before routing to the Branch Manager for formal sign-off.
* **Geofence Triage:** Performing first-level investigations of failed GPS geofence check-ins and preparing coordinate override justifications.
* **Daily Team Huddles and Roster Synching:** Coordinating morning allocations, verifying agent connectivity, and reviewing evening collection records.

### 1.3 Target Audience
This operations manual is written for:
* **Team Leaders (TLs)** and Field Force Supervisors managing groups of physical recovery executives.
* **Branch Managers (BMMs)** auditing team allocations, operational compliance levels, and supervisor performance metrics.
* **Internal Compliance Auditors** verifying that supervisor workflows adhere to corporate standards and legal collection requirements.

---

## 2. APPLICABLE STANDARDS & COMPLIANCE BOUNDARIES

The Team Leader acts as the direct supervisor of field recovery agents. All allocation plans, routing sequences, and agent interactions must align with:

```
┌─────────────────────────────────────────────────────────────┐
│                 COMPLIANCE CONTROL RING                     │
├───────────────┬─────────────────────────────────────────────┤
│ RBI FPC       │ Fair Practices Code for Lenders             │
├───────────────┼─────────────────────────────────────────────┤
│ DPDP Act      │ Digital Personal Data Protection Act (2023) │
├───────────────┼─────────────────────────────────────────────┤
│ ISO 27001     │ Data Privacy and System Access Standards    │
├───────────────┼─────────────────────────────────────────────┤
│ SLA Targets   │ Case Allocation & Escalation Metrics        │
└───────────────┴─────────────────────────────────────────────┘
```

> **CRITICAL COMPLIANCE NOTICE:** Team Leaders are responsible for ensuring field agents strictly adhere to RBI-permitted operational outreach hours (08:00 to 19:00). Any supervisor who instructs or allows an agent to conduct debtor contact outside of these hours will face immediate suspension and disciplinary action.

---

## 3. DEFINITIONS

* **Team Recovery Coefficient (TRC):** The consolidated efficiency metric tracking actual collected cash values against the team's monthly target allocation.
* **Roster Synchronization Check:** The morning process of verifying that all scheduled field agents have logged in, synchronized their local databases, and passed GPS checks.
* **Geofence Violation Alert:** An automated notification triggered when an agent logs a visit check-in outside the assigned 100-meter GPS geofence radius.
* **Case Dispersion Queue:** The branch's pending accounts list, filtered by zip code, case priority, outstanding balance, and age of debt.
* **First-Tier Settlement Endorsement:** The process where a Team Leader verifies a settlement proposal's financial details and visit histories before forwarding to the Branch Manager.

---

## 4. SYSTEM OVERVIEW & TEAM LEADER DESK

The Team Leader Desk provides a secure, web-based supervisor interface for managing local field operations. Integrating real-time GPS feeds, branch case databases, and mobile check-in histories, the desk allows the Team Leader to manage active agent workloads and monitor compliance across their team.

### 4.1 Platform Data Streams & Storage Integration
The desk is fully integrated with the core EDROS platform architecture:
* **Neon PostgreSQL Master Instance:** Pulls supervisor assignments, team rosters, account lists, targets, and security logs.
* **Upstash Redis Cluster:** Processes live coordinate streams, geofence validations, active supervisor tokens, and rate-limit counters.
* **Cloudflare R2 Object Storage:** Archives signed settlement proposals, branch deposit sheets, and field visit photos.

---

## 5. NAVIGATION & OPERATION FLOW

The Team Leader Desk is organized around five main functional areas designed to ensure quick navigation and logical separation of duties:

```
[ Team Leader Desk ]
          │
          ├──► [ Case Allocation Engine ] (Unallocated Accounts, Agent Sliders, Route Maps)
          │
          ├──► [ Live Field Tracker ] (Interactive GPS Map, Executive Status, Check-in Feeds)
          │
          ├──► [ Daily Reconciliation Desk ] (Roster Sync, Collection Records, Cash Sweeps)
          │
          ├──► [ Settlement Endorsements ] (Proposal Reviews, Endorsement Workspace)
          │
          └──► [ Geofence Disputes ] (Failed GPS Audits, Initial Triage, Override Requests)
```

---

## 6. DAILY CASE ALLOCATION & AGENT WORKLOAD BALANCING

The Case Allocation Engine allows the Team Leader to distribute pending branch accounts to field executives:

### 6.1 Allocating and Balancing Caseloads
1. At the start of the operational day (08:00), navigate to **Case Allocation Engine** -> **Unallocated Accounts**.
2. Review the list of unassigned accounts, sorted by priority, balance, and zip code.
3. Proximity Dispatch: Use the interactive map to identify active agents closest to the debtor's zip codes.
4. Workload Balancing: Adjust agent allocation sliders to distribute cases evenly, ensuring no agent exceeds the maximum workload cap (e.g., *max 40 active cases*).
5. Click **Confirm & Dispatch Cases**. The system assigns the accounts, synchronizes the agent databases, and updates the mobile application queues.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: Case Allocation Engine Interface             |
| Capture the Case Allocation workspace, focusing on the agent workload sliders,|
| the unassigned case tables, and the proximity-match toggle indicators.      |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 7. REAL-TIME FIELD FORCE TRACKING & VISIT MONITORING

The Live Field Tracker provides a real-time overview of the team's recovery operations and compliance levels:

```
+─────────────────────────────────────────────────────────────────────────────+
| LIVE FIELD FORCE MONITOR                                                    |
|                                                                             |
| Active Executives:   [ 12/12 Checked-In ] - Signal Integrity: 100.00%       |
| Completed Visits:    [ 48 Scheduled Visits ] - In-Progress Visits: 6        |
| Geofence Success:    [ 98.20% Passed ]    - Unresolved Disputes: 1 Case    |
| Operational Status:  [ TIME GATES ACTIVE (08:00 - 19:00) ]                  |
+─────────────────────────────────────────────────────────────────────────────+
```

### 7.1 Live Field Monitoring Widgets
* **Live GPS Tracking Map:** An interactive local map showing the real-time positions of checked-in field executives and the locations of scheduled debtor visits.
* **Agent Status Stream:** A live feed displaying agent activities, highlighting successful check-ins, delayed visits, and low battery or connection warnings.
* **Visit Delay Alerts:** Automatically flags any visits that exceed the scheduled timeframe, prompting the TL to check in with the executive.

---

## 8. DAILY CHECK-IN RECONCILIATION & RECOVERY LOGS

To prevent fraud and maintain strict accounting controls, Team Leaders must conduct daily huddles and check-in reconciliations:

### 8.1 Daily Roster Synchronization & Cash Review
1. Morning Huddle (08:00): Verify that all scheduled field agents have logged in, synchronized their local databases, and passed GPS check-ins.
2. Evening Review (18:30): At the end of the operational day, verify the cash collection records submitted via mobile applications.
3. Reconciliation Desk: Navigate to **Daily Reconciliation Desk** and select the active roster.
4. Cash Review: Review and verify physical cash receipts against digital collection logs, confirming zero variance.
5. Forward Reconciliation: Once verified, forward the reconciliation records to the Branch Manager for physical cash sweeps and bank deposit processing.

---

## 9. EXECUTIVE YIELD PERFORMANCE ANALYSIS

To optimize recovery rates, the Team Leader conducts weekly performance audits of the field executive roster:

### 9.1 Executive Yield Rates and Performance Variables

| Executive Name | Active Caseload | Month-to-Date Collections | Geofence Success Rate | Average Visit Delay | Compliance Audit |
| :--- | :---: | :--- | :---: | :---: | :---: |
| **Rajesh Kumar** | 35 Cases | INR 450,000 | 100.00% (Passed) | 12 Minutes | Passed |
| **Amit Sharma** | 32 Cases | INR 380,000 | 98.40% (Passed) | 18 Minutes | Passed |
| **Pooja Patel** | 38 Cases | INR 410,000 | 97.20% (Passed) | 15 Minutes | Passed |
| **Sanjay Singh** | 30 Cases | INR 220,000 | 91.50% (Warning) | 28 Minutes | Passed |

---

## 10. SETTLEMENT PROPOSAL ENDORSEMENTS & REVIEW SOP

While Team Leaders do not have independent settlement approval authority, they act as the primary review tier for proposals:

### 10.1 Reviewing and Endorsing Settlement Proposals
1. Navigate to **Settlement Endorsements** -> **Review Queue**.
2. Select an active proposal: e.g., `CASE-HDFC-MUM-10250`.
3. Review the borrower's total outstanding balance, payment history, collector visit notes, and the proposed write-off percentage (e.g., *14.50%*).
4. Verify the visit history logs to confirm the agent has conducted the mandatory physical discussions.
5. If verified, click **Endorse & Route to BMM**.
6. Enter a brief justification log explaining the endorsement (e.g., *verified borrower's financial distress and matching physical visit logs*).
7. The system registers the endorsement, updates the case status, and routes the proposal to the Branch Manager's approval queue.

```
+─────────────────────────────────────────────────────────────────────────────+
| SCREEN CAPTURE RECOMMENDATION: Settlement Endorsement Workspace             |
| Capture the settlement evaluation page, showing the haircut range slider,   |
| verification fields, and the "Endorse & Route to BMM" action button.        |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 11. GEOFENCE DISPUTE VERIFICATION & INITIAL TRIAGE

When physical recovery executives fail standard check-ins due to GPS drift or physical access limitations, the Team Leader performs first-level triage:

### 11.1 Triaging Geofence Failures
1. Navigate to **Geofence Disputes** -> **Triage Workspace**.
2. Select an active geofence failure alert: e.g., `DIS-MUM-90120`.
3. Review the agent's submission, location coordinates, check-in photo, and geofence coordinates.
4. Verify physical indicators (e.g., matching landmark in check-in photo) to confirm the agent was at the correct address.
5. If the agent's position is verified, click **Request GPS Override**.
6. Enter a brief justification log explaining the override request (e.g., *GPS drift verified; landmark in photo matches debtor's address*).
7. The system forwards the override request to the Branch Manager's queue for formal authorization.

---

## 12. OPERATIONAL KEY PERFORMANCE INDICATORS (KPIS)

Team operations are tracked against key performance indicators (KPIs) to monitor compliance and recovery metrics.

```
+─────────────────────────────────────────────────────────────────────────────+
| TEAM PERFORMANCE TARGETS                                                    |
|                                                                             |
| Team Recovery Yield:       [ Target: > 75.00% ]                             |
| Geofence Success Rate:     [ Target: > 98.00% Passed ]                      |
| Roster Sync Compliance:    [ Target: 100.00% On-Time ]                      |
| Visit Delay Ratio:         [ Target: < 15 Minutes ]                         |
+─────────────────────────────────────────────────────────────────────────────+
```

* **Team Recovery Yield:** Maintain a team-level recovery conversion rate of `> 75.00%`.
* **Geofence Success Rate:** 98.00% or more of completed debtor visits must pass GPS-geofenced verification.
* **Roster Sync Compliance:** 100.00% of scheduled field agents must synchronize their databases and log in on time.

---

## 13. GOVERNANCE CONTROLS & MONITORING SEALS

Governance and security standards are enforced through automated controls built directly into the platform:

* **Sovereign Portfolio Separation:** Tenant banking data is isolated at the schema level, ensuring data privacy.
* **Operational Time Locks:** Enforces system-wide lockouts outside of RBI-permitted hours (08:00 to 19:00).
* **Closed-Loop Geofencing:** Verifies field coordinates against branch geofences during check-ins, logging mismatch alerts to the audit trail.

---

## 14. DAILY, WEEKLY, AND MONTHLY SOP CHECKLISTS

The Team Leader must complete these checklists to verify performance and compliance:

### 14.1 Daily Checklist (Supervision & Allocation)
* [ ] **Dashboard Check:** Review the TL dashboard, checking agent rosters, active workloads, and check-in times.
* [ ] **Morning Allocation:** Assign pending branch accounts and route maps to active field executives.
* [ ] **Evening Reconciliation:** Verify and reconcile cash collection records turned in by field executives.

### 14.2 Weekly Checklist (Audits & Balances)
* [ ] **Roster Audit:** Review branch staffing levels, workloads, and agent performance matrices.
* [ ] **Case Rebalancing:** Redistribute stagnated or unallocated cases to optimize coverage.
* [ ] **Geofence Audit:** Audit failed check-ins and verify that override requests have matching justification logs.

### 14.3 Monthly Checklist (Reporting & Planning)
* [ ] **Performance Review:** Compile and submit monthly team performance summaries to the Branch Manager.
* [ ] **Target Adjustments:** Update local executive targets and case allocation parameters for the upcoming month.
* [ ] **RCA Audit:** Conduct a root-cause analysis on recurring geofence failures or SLA delays, logging CAPA tickets where needed.

---

## 15. BEST PRACTICES & TEAM SUPERVISION STRATEGIES

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

#### Q1: Can a Team Leader authorize a settlement haircut?
No. Team Leaders only have endorsement authority. They verify the proposal details and route it to the Branch Manager, who can formally approve haircuts up to 20.00%.

#### Q2: What happens if an agent fails a GPS-geofenced check-in?
The system blocks the check-in and logs a failed coordinate warning. The agent must log a geofence dispute, which the TL reviews and can escalate to the Branch Manager for formal override.

#### Q3: How often do field agent locations update on the tracker?
Field agent coordinates update in real-time (every 60 seconds) whenever the agent has a stable internet connection and an active check-in status.

---

## 20. GLOSSARY & REFERENCES

### 20.1 Glossary of Terms
* **TRC:** Team Recovery Coefficient. Tracks collected value against monthly team target allocations.
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

### 21.1 Team Dispatch Record Log Template
When daily case allocations are dispatched, the supervisor must log the details using the following structured template:

```
DAILY TEAM DISPATCH RECORD LOG:
Dispatch ID:    DIS-TLM-2026-0601
Date Logged:    2026-07-15 03:40:00 UTC
Branch Office:  Mumbai Central Branch (BR-MUM-001)
Team Leader:    Suresh Gupta (EMP-MUM-012)
Active Agents:  12 Executives Dispatched
Total Accounts: 180 Active Portfolios Dispatched
Audit Status:   DISPATCHED & COMPLIANT (Logged to audit ledger)
```

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
