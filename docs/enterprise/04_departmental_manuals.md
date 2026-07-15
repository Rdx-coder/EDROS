# EDROS ENTERPRISE DOCUMENTATION LIBRARY
## MODULE 04: DEPARTMENTAL OPERATIONS AND CLIENT/CUSTOMER INTERFACES

---

## DOCUMENT 16: HR MANUAL

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-HRM-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / HUMAN RESOURCES DEPT ONLY
* **Author:** Global Human Resources Director
* **Published Date:** July 15, 2026

---

### VERSION HISTORY
| Version | Date | Author | Description of Change | Approved By |
|---|---|---|---|---|
| 1.0.0 | July 15, 2026 | Global HR Director | Human Resources Standard Operating Guide. | Chief Operations Officer |

---

### 16.1 PURPOSE
This manual provides standard instructions for HR Business Partners, Recruiters, and Payroll Managers when managing the operational status of EDROS personnel.

### 16.2 INTENDED AUDIENCE
* **HR Generalists & Managers**
* **Payroll Processing Administrators**
* **Workforce Resource Schedulers**

### 16.3 OPERATIVE PROCESSES

#### Procedure A: Onboard and Create a New Operator Profile
1. Navigate to **Operations Deck** -> **Staff Roster & Payroll**.
2. Click **ADD OPERATOR** to reveal the profile creation form.
3. Fill fields accurately:
   * **First Name & Last Name** (e.g. Anand Verma)
   * **Contact Phone** (e.g. +91-99123-45678)
   * **Department Selection** (e.g. Legal Operations, Debt Recoveries, HR and Admin)
   * **Job Grade Selection** (e.g. GRADE_E3 - Team Leader level)
   * **Base Salary** (e.g. 75,000.00 - entered as raw decimal format)
4. Click **SAVE PROFILE & SET PERMISSIONS** to compile and persist the profile into PostgreSQL.

#### Procedure B: Setup Geofence Attendance Rules
1. Navigate to **Staff Roster & Payroll** -> **Settings**.
2. Select the "Geofence Registry".
3. Define Latitude and Longitude center-points and specify acceptable radial distances (typically 100 meters). This ensures browser-level `navigator.geolocation` checks function correctly during field team check-ins.

---

## DOCUMENT 17: FINANCE MANUAL

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-FIN-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / FINANCE & ACCOUNTING INTERNAL
* **Author:** Principal Finance Controller
* **Published Date:** July 15, 2026

---

### VERSION HISTORY
| Version | Date | Author | Description of Change | Approved By |
|---|---|---|---|---|
| 1.0.0 | July 15, 2026 | Chief Financial Controller | Financial Ledger Integration Protocols. | Chief Financial Officer |

---

### 17.1 PURPOSE
This manual details banking ledger adjustments, settlement accounting, commission calculations, and staff payroll dispatches.

### 17.2 INTENDED AUDIENCE
* **Financial Analysts & Ledger Controllers**
* **Treasury Specialists**
* **Internal Auditing Officers**

### 17.3 CORE FINANCIAL WORKFLOWS

#### Procedure: Issue Monthly Staff Payroll Dispatch
1. Select **Operations Deck** -> **Staff Roster & Payroll**.
2. Filter the directory list to find the active target employee.
3. Select the employee row to render their metadata details card.
4. Click **MONTHLY PAYSLIP GATE** to launch the payout calculator.
5. In the payroll dispatch form, specify parameters:
   * **Target Payroll Month:** e.g. `2026-07`
   * **Performance Bonus:** e.g. `12500.00`
   * **Deductions:** e.g. `1500.00`
6. Click **DISPATCH BANK TRANSFER** to commit the financial transaction.
7. Upon successful processing, the system writes a state ledger event marked `Payout Document Dispatched`.

---

## DOCUMENT 18: LEGAL OPERATIONS MANUAL

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-LOM-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / LEGAL DEPARTMENT EXCLUSIVE
* **Author:** Chief Legal Counsel, Core Banking
* **Published Date:** July 15, 2026

---

### VERSION HISTORY
| Version | Date | Author | Description of Change | Approved By |
|---|---|---|---|---|
| 1.0.0 | July 15, 2026 | Chief Legal Counsel | Litigation and docket workflow specs. | Legal Director, Risk Division |

---

### 18.1 PURPOSE
This manual provides standard operating procedures for generating legal demands, managing dockets, and coordinating regional court hearings.

### 18.2 INTENDED AUDIENCE
* **Corporate Legal Officers & Para-legals**
* **Litigation Specialist Lawyers**
* **External Panel Advocates**

### 18.3 LEGAL CASE PROCEDURES

#### Procedure A: Register a New Court litigation Suit
1. Select **Operations Deck** -> **Court & Notices Desk**.
2. Select the **Court Litigation Suits** sub-tab.
3. Click **REGISTER NEW COURT SUIT** to open the registration form.
4. Fill input fields:
   * **Litigation Case Reference Number:** e.g. `OS/6102/2026`
   * **Target Judiciary / Court:** Select options (e.g. High Court of Delhi)
   * **First Scheduled Hearing Date:** e.g. `2026-09-12`
   * **Litigation Suit Nature:** Select `RECOVERY_SUIT`
5. Click **SAVE LITIGATION CASE & OPEN DOCKET** to write records.

#### Procedure B: Adjourn a Scheduled Hearing
1. Under **Court Litigation Suits**, select the target case row.
2. Under "Case Action Docket", click **ADJOURN HEARING**.
3. Choose the adjournment reason: `JUDGE_ABSENT`, `ADVOCATE_UNAVAILABLE`, or `COMPROMISE_TALKS`.
4. Define the **Next Scheduled Hearing Date** via calendar input.
5. Write specific court order details or notes.
6. Click **COMMIT ADJOURNMENT** to update the litigation ledger.

#### Procedure C: Draft Legal Notices
1. Select **Court & Notices Desk** -> **Legal notices Dispatch** sub-tab.
2. Click **DRAFT NEW LEGAL NOTICE**.
3. Select the template style: `DEMAND_NOTICE`, `SECTION_138_BOUNCE`, or `ARBITRATION_INVOCATION`.
4. Enter unique Reference ID (e.g. `EDROS-LN-2026-1102`).
5. Link notice to the related Litigation Suit.
6. Record courier tracking numbers for verification.
7. Click **GENERATE LEGAL NOTICE & WATERMARK PDF** to generate the document.

---

## DOCUMENT 19: BANK CLIENT PORTAL MANUAL

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-BCP-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / B2B EXTERNAL PORTAL
* **Author:** Business Integration Architect
* **Published Date:** July 15, 2026

---

### 19.1 SYSTEM OVERVIEW FOR CLIENT CREDITOR BANKS
The Bank Client Portal allows external financial institutions (creditors) to log in to EDROS to audit their outsourced portfolios.

#### Core Capabilities:
1. **Bulk Ingestion Verification:** Monitor successful processing of uploaded portfolios (Drizzle integration ensures raw data maps correctly to schemas).
2. **Real-time Recovery Telemetry:** View collections performance, PTP success ratios, and settlement progress.
3. **Litigation Auditing:** Track status changes on active court suits (e.g., dockets, next hearing calendars).

---

## DOCUMENT 20: CUSTOMER PORTAL MANUAL

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-CPM-2026-V1
* **Version:** 1.0.0
* **Classification:** PUBLIC DISTRIBUTION / DEBTOR ENGAGEMENT
* **Author:** Principal UX Designer, Customer Experience
* **Published Date:** July 15, 2026

---

### 20.1 SYSTEM OVERVIEW FOR DEBTOR ENGAGEMENT
The Customer Portal provides a secure, friction-free interface for debtors to inspect their outstanding accounts and settle balances.

#### Core Capabilities:
1. **Interactive Settlement Calculator:** Debtors can calculate settlement scenarios and view payoff rates.
2. **PTP (Promise to Pay) Scheduler:** Debtors can schedule installment payments and verify banking transaction routes.
3. **Receipt Downloads:** Instantly generate watermarked, RC4-encrypted payment receipts.

---
