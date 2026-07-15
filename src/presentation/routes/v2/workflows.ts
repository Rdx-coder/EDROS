/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Response } from "express";
import { UserRole } from "../../../types";
import { authorizePermission } from "../../middlewares";
import { StructuredLogger } from "../../../infrastructure/logging";

// Import existing databases to maintain single-source-of-truth consistency
import { casesDb, timelinesDb, teleCallsDb } from "./recovery";
import { employeesDb, attendancesDb, payslipsDb } from "./employees";
import { ledgerAccountsDb, doubleEntryJournalsDb } from "./finance";
import { litigationCasesDb } from "./legal";

const router = express.Router();

// =========================================================================
// MOCK DATABASE CONTEXTS (STATED-PERSISTENCE STATE ENGINES)
// =========================================================================

export interface ApprovalRequest {
  id: string;
  type: "DOCUMENT" | "EMPLOYEE" | "EXPENSE" | "RECOVERY" | "BANK" | "ROLE";
  status: "PENDING" | "APPROVED" | "REJECTED";
  makerId: string;
  makerEmail: string;
  checkerId?: string;
  checkerEmail?: string;
  resourceId: string;
  payload: any;
  narration: string;
  submittedAt: string;
  evaluatedAt?: string;
  rejectionReason?: string;
}

export interface Reminder {
  id: string;
  caseId: string;
  debtorName: string;
  executiveId: string;
  reminderType: "PTP_DUE" | "COURT_HEARING" | "AUCTION_DATE" | "SLA_BREACH";
  reminderDate: string;
  notes: string;
  status: "PENDING" | "DISMISSED" | "TRIGGERED";
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  recipientRole?: UserRole;
  recipientId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SarfaesiRecord {
  id: string;
  caseId: string;
  debtorName: string;
  sec13_2NoticeDate: string;
  sec13_4PossessionDate?: string;
  assetDetails: string;
  estimatedValuation: number;
  status: "DRAFT" | "NOTICE_ISSUED" | "ASSET_POSSESSED" | "AUCTIONED" | "LITIGATION_STAY";
  createdAt: string;
}

export interface AuctionRecord {
  id: string;
  sarfaesiId: string;
  caseId: string;
  reservePrice: number;
  currentHighestBid?: number;
  highestBidder?: string;
  auctionDate: string;
  status: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "FAILED_NO_BIDS";
  bidsHistory: Array<{ bidder: string; amount: number; time: string }>;
  createdAt: string;
}

export interface PaymentReceipt {
  id: string;
  caseId: string;
  amount: number;
  type: "FULL" | "PARTIAL";
  paymentMode: string;
  referenceNo: string;
  paidAt: string;
  postedBy: string;
}

export interface ExpenseRecord {
  id: string;
  employeeId: string;
  employeeEmail: string;
  amount: number;
  purpose: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  receiptUrl?: string;
  createdAt: string;
}

// In-memory operational databases
export let approvalsDb: ApprovalRequest[] = [
  {
    id: "appr-001",
    type: "RECOVERY",
    status: "PENDING",
    makerId: "emp-901",
    makerEmail: "rohan.sharma@edros.com",
    resourceId: "case-001",
    payload: { proposedSettlement: 200000, haircutPct: 27.2 },
    narration: "Debtor agrees to lump sum settlement within 7 days. Request L2 branch manager approval.",
    submittedAt: "2026-07-14T04:30:00.000Z"
  },
  {
    id: "appr-002",
    type: "EXPENSE",
    status: "PENDING",
    makerId: "emp-901",
    makerEmail: "rohan.sharma@edros.com",
    resourceId: "exp-201",
    payload: { amount: 1500, purpose: "Field visit travel to Pune outskirts" },
    narration: "Inter-city railway tickets for asset physical verification.",
    submittedAt: "2026-07-14T04:45:00.000Z"
  }
];

export let remindersDb: Reminder[] = [
  {
    id: "rem-1",
    caseId: "case-001",
    debtorName: "Aditya Deshmukh",
    executiveId: "emp-901",
    reminderType: "PTP_DUE",
    reminderDate: "2026-07-16T10:00:00.000Z",
    notes: "Promise To Pay date is near. Debtor promised $20,000 partial payment.",
    status: "PENDING"
  }
];

export let notificationsDb: NotificationItem[] = [
  {
    id: "notif-1",
    title: "New Case Assigned",
    body: "Debt recovery case 'case-003' (Karan Johar) has been registered in your state branch.",
    recipientRole: UserRole.RECOVERY_EXECUTIVE,
    isRead: false,
    createdAt: "2026-07-14T01:00:00.000Z"
  },
  {
    id: "notif-2",
    title: "Maker Checker Alert",
    body: "Settlement haircut request 'appr-001' submitted. Requires checker evaluation.",
    recipientRole: UserRole.BRANCH_MANAGER,
    isRead: false,
    createdAt: "2026-07-14T04:30:00.000Z"
  }
];

export let sarfaesiDb: SarfaesiRecord[] = [
  {
    id: "sarf-101",
    caseId: "case-002",
    debtorName: "Vikram Singhania",
    sec13_2NoticeDate: "2026-06-10T00:00:00.000Z",
    assetDetails: "Flat 401, Crescent Towers, Bandra West, Mumbai",
    estimatedValuation: 1800000,
    status: "NOTICE_ISSUED",
    createdAt: "2026-06-10T00:00:00.000Z"
  }
];

export let auctionsDb: AuctionRecord[] = [];
export let paymentsDb: PaymentReceipt[] = [];
export let expensesDb: ExpenseRecord[] = [
  {
    id: "exp-201",
    employeeId: "emp-901",
    employeeEmail: "rohan.sharma@edros.com",
    amount: 1500,
    purpose: "Field visit travel to Pune outskirts",
    status: "PENDING",
    createdAt: "2026-07-14T04:45:00.000Z"
  }
];

// Transaction logs for tracking internal state adjustments and ROLLBACK events
export let rollbackLogsDb: any[] = [];

// Track case versions for concurrency protection
export let caseVersionsDb: Record<string, number> = {
  "case-001": 1,
  "case-002": 1,
  "case-003": 1
};

// =========================================================================
// 1. MAKER-CHECKER APPROVAL QUEUE ENGINE
// =========================================================================

/**
 * GET: Retrieve all Maker-Checker approval requests
 */
router.get(
  "/approvals",
  authorizePermission([
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.RECOVERY_HEAD,
    UserRole.REGIONAL_MANAGER,
    UserRole.BRANCH_MANAGER,
    UserRole.TEAM_LEADER
  ]),
  async (req: any, res: Response) => {
    res.json({ success: true, count: approvalsDb.length, data: approvalsDb });
  }
);

/**
 * POST: Submit a Maker-Checker Approval Request
 */
router.post(
  "/approvals",
  authorizePermission([
    UserRole.RECOVERY_EXECUTIVE,
    UserRole.TEAM_LEADER,
    UserRole.LEGAL_COUNSEL,
    UserRole.BRANCH_MANAGER
  ]),
  async (req: any, res: Response) => {
    const { type, resourceId, payload, narration } = req.body;

    if (!type || !resourceId || !payload || !narration) {
      return res.status(400).json({
        error: "VALIDATION_FAILED",
        message: "Missing workflow parameters. type, resourceId, payload, and narration are required."
      });
    }

    const operator = req.operator;

    const request: ApprovalRequest = {
      id: `appr-${Date.now()}`,
      type,
      status: "PENDING",
      makerId: operator.id,
      makerEmail: operator.email,
      resourceId,
      payload,
      narration,
      submittedAt: new Date().toISOString()
    };

    approvalsDb.push(request);

    // Push notification to potential checkers
    notificationsDb.push({
      id: `notif-${Date.now()}`,
      title: `Approval Pending: ${type}`,
      body: `Review required for request: ${narration.substring(0, 50)}...`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    StructuredLogger.info(`[WORKFLOW] Maker ${operator.email} submitted ${type} approval request ${request.id}`, req.correlationId);

    res.status(201).json({
      success: true,
      message: "Maker-Checker approval request submitted successfully to the verification queue.",
      data: request
    });
  }
);

/**
 * POST: Evaluate a Maker-Checker request (Approve/Reject with dual control / rollback check)
 */
router.post(
  "/approvals/:id/evaluate",
  authorizePermission([
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.RECOVERY_HEAD,
    UserRole.REGIONAL_MANAGER,
    UserRole.BRANCH_MANAGER,
    UserRole.TEAM_LEADER
  ]),
  async (req: any, res: Response) => {
    const reqId = req.params.id;
    const { action, reason } = req.body; // action: APPROVE or REJECT

    if (!action || !["APPROVE", "REJECT"].includes(action)) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "action must be either APPROVE or REJECT." });
    }

    const appIdx = approvalsDb.findIndex((a) => a.id === reqId);
    if (appIdx === -1) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Approval request not found in database queue." });
    }

    const approval = approvalsDb[appIdx];
    if (approval.status !== "PENDING") {
      return res.status(400).json({ error: "ALREADY_PROCESSED", message: `This request is already ${approval.status}.` });
    }

    const checker = req.operator;

    // ─── MAKER CHECKER BUSINESS RULE: PREVENTION OF SELF-APPROVAL ───
    if (approval.makerId === checker.id) {
      return res.status(403).json({
        error: "MAKER_CHECKER_VIOLATION",
        message: "Dual Custody Security Policy: A Maker cannot evaluate or approve their own submitted requests."
      });
    }

    if (action === "REJECT") {
      approvalsDb[appIdx].status = "REJECTED";
      approvalsDb[appIdx].checkerId = checker.id;
      approvalsDb[appIdx].checkerEmail = checker.email;
      approvalsDb[appIdx].rejectionReason = reason || "Declined by compliance checker.";
      approvalsDb[appIdx].evaluatedAt = new Date().toISOString();

      return res.json({
        success: true,
        message: "Request successfully REJECTED. Resource state remains unchanged.",
        data: approvalsDb[appIdx]
      });
    }

    // ─── TRANSACTION BOUNDARY WITH IN-MEMORY ROLLBACK STRATEGY ───
    // Save original state copy for safety rollback
    let rollbackAction: (() => void) | null = null;
    try {
      if (approval.type === "RECOVERY") {
        // Approve settlement proposal with outstanding deduction
        const caseIdx = casesDb.findIndex((c) => c.id === approval.resourceId);
        if (caseIdx === -1) throw new Error("Referenced case does not exist.");

        const oldCaseState = { ...casesDb[caseIdx] };
        rollbackAction = () => {
          casesDb[caseIdx] = oldCaseState;
        };

        casesDb[caseIdx].stage = "STAGE_6_SETTLED";
        casesDb[caseIdx].outstandingAmount = 0;
        casesDb[caseIdx].status = "SETTLED";

        timelinesDb.push({
          id: `time-${Date.now()}`,
          caseId: approval.resourceId,
          eventTitle: "Settlement Approved via Checker",
          details: `Settlement finalized. Approved by Checker: ${checker.email}. Info: ${approval.narration}`,
          eventType: "SETTLEMENT_PROPOSAL",
          occurredAt: new Date().toISOString()
        });

      } else if (approval.type === "EXPENSE") {
        const expIdx = expensesDb.findIndex((e) => e.id === approval.resourceId);
        if (expIdx === -1) throw new Error("Referenced expense record not found.");

        const oldExpState = { ...expensesDb[expIdx] };
        rollbackAction = () => {
          expensesDb[expIdx] = oldExpState;
        };

        expensesDb[expIdx].status = "APPROVED";

      } else if (approval.type === "EMPLOYEE") {
        const empIdx = employeesDb.findIndex((e) => e.id === approval.resourceId);
        if (empIdx === -1) throw new Error("Referenced employee profile not found.");

        const oldEmpState = { ...employeesDb[empIdx] };
        rollbackAction = () => {
          employeesDb[empIdx] = oldEmpState;
        };

        employeesDb[empIdx].status = "ACTIVE";

      } else if (approval.type === "ROLE") {
        const empIdx = employeesDb.findIndex((e) => e.id === approval.resourceId);
        if (empIdx === -1) throw new Error("Referenced employee profile not found.");

        const userIdx = employeesDb.findIndex((e) => e.id === approval.resourceId);
        const oldRole = employeesDb[empIdx].jobGrade;
        rollbackAction = () => {
          employeesDb[empIdx].jobGrade = oldRole;
        };

        employeesDb[empIdx].jobGrade = approval.payload.newGrade || "M1";
      }

      // If all state changes succeed, commit the approval
      approvalsDb[appIdx].status = "APPROVED";
      approvalsDb[appIdx].checkerId = checker.id;
      approvalsDb[appIdx].checkerEmail = checker.email;
      approvalsDb[appIdx].evaluatedAt = new Date().toISOString();

      StructuredLogger.info(`[WORKFLOW] Request ${reqId} APPROVED by checker ${checker.email}`, req.correlationId);

      res.json({
        success: true,
        message: "Dual-custody verification succeeded. Request committed.",
        data: approvalsDb[appIdx]
      });

    } catch (err: any) {
      // Execute Rollback on Exception
      if (rollbackAction) {
        rollbackAction();
        rollbackLogsDb.push({
          id: `rb-${Date.now()}`,
          requestId: reqId,
          reason: err.message,
          timestamp: new Date().toISOString()
        });
        StructuredLogger.error(`[ROLLBACK] Workflow state rolled back for request ${reqId} due to: ${err.message}`, req.correlationId);
      }
      res.status(500).json({
        error: "WORKFLOW_COMMIT_FAILED",
        message: `Transactional commit failed. State was safely rolled back. Detail: ${err.message}`
      });
    }
  }
);

// =========================================================================
// 2. PAYMENTS & PARTIAL PAYMENTS WORKFLOW (WITH TRANSACTIONAL INTEGRITY)
// =========================================================================

/**
 * GET: Fetch all debt collection payment receipts
 */
router.get(
  "/payments",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.RECOVERY_HEAD, UserRole.BANK_COMPLIANCE_OFFICER]),
  async (req: any, res: Response) => {
    res.json({ success: true, count: paymentsDb.length, data: paymentsDb });
  }
);

/**
 * POST: Record payment (Handles Full and Partial Payments with optimistic locking concurrency checks)
 */
router.post(
  "/cases/:id/payments",
  authorizePermission([UserRole.RECOVERY_EXECUTIVE, UserRole.TEAM_LEADER, UserRole.BRANCH_MANAGER]),
  async (req: any, res: Response) => {
    const caseId = req.params.id;
    const { amount, paymentMode, referenceNo, expectedVersion } = req.body;

    if (!amount || amount <= 0 || !paymentMode || !referenceNo) {
      return res.status(400).json({
        error: "VALIDATION_FAILED",
        message: "Missing parameters. Positive amount, paymentMode, and referenceNo are required."
      });
    }

    const caseIdx = casesDb.findIndex((c) => c.id === caseId && !c.isDeleted);
    if (caseIdx === -1) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Case file not found." });
    }

    const debtCase = casesDb[caseIdx];

    // Concurrency / Optimistic lock check
    const currentVersion = caseVersionsDb[caseId] || 1;
    if (expectedVersion !== undefined && expectedVersion !== currentVersion) {
      return res.status(409).json({
        error: "CONCURRENCY_CONFLICT",
        message: `Case state was modified by another coordinator. Reload case data. (Current ver: ${currentVersion}, Expected: ${expectedVersion})`
      });
    }

    // Business rule: Can't pay more than outstanding amount
    if (amount > debtCase.outstandingAmount) {
      return res.status(400).json({
        error: "BUSINESS_RULE_VIOLATION",
        message: `Payment amount (${amount}) exceeds current outstanding debt balance (${debtCase.outstandingAmount}).`
      });
    }

    // ─── CONCURRENCY SAFE TRANSACTION START WITH ROLLBACK STRATEGY ───
    const oldCaseState = { ...debtCase };
    const oldLedgerState = JSON.parse(JSON.stringify(ledgerAccountsDb)); // deep copy

    try {
      const outstandingBefore = debtCase.outstandingAmount;
      const isFullPayment = amount === outstandingBefore;

      // Adjust case balances
      casesDb[caseIdx].outstandingAmount -= Number(amount);
      if (isFullPayment) {
        casesDb[caseIdx].stage = "STAGE_6_SETTLED";
        casesDb[caseIdx].status = "SETTLED";
      } else {
        casesDb[caseIdx].stage = "STAGE_3_FIELD_VISIT"; // active field collection
      }

      // Bump case state version
      caseVersionsDb[caseId] = currentVersion + 1;

      // Record receipt
      const receipt: PaymentReceipt = {
        id: `rcpt-${Date.now()}`,
        caseId,
        amount: Number(amount),
        type: isFullPayment ? "FULL" : "PARTIAL",
        paymentMode,
        referenceNo,
        paidAt: new Date().toISOString(),
        postedBy: req.operator.email
      };
      paymentsDb.push(receipt);

      // Bookkeeping Ledger updates (Debit Assets / Credit Income)
      // Account 1200_FEES_REC (Asset ledger index 0), rev (index 1)
      ledgerAccountsDb[0].balance += Number(amount);
      ledgerAccountsDb[1].balance += Number(amount);

      // Post double entry journal voucher
      doubleEntryJournalsDb.push({
        id: `je-pay-${Date.now()}-d`,
        accountId: ledgerAccountsDb[0].id,
        voucherNumber: `VCH-PAY-${Date.now().toString().slice(-6)}`,
        debitAmount: Number(amount),
        creditAmount: 0,
        narration: `Ref: ${referenceNo}. Payment for case ${caseId}`,
        transactionDate: new Date().toISOString()
      });

      // Audit and Timeline logs
      timelinesDb.push({
        id: `time-${Date.now()}`,
        caseId,
        eventTitle: isFullPayment ? "Full Debt Paid" : "Partial Payment Received",
        details: `Amount: $${amount}. Paid via: ${paymentMode}. Tx Ref: ${referenceNo}`,
        eventType: "SETTLEMENT_PROPOSAL",
        occurredAt: new Date().toISOString()
      });

      StructuredLogger.info(`[FIN] Recorded payment of ${amount} for case ${caseId}. Full: ${isFullPayment}`, req.correlationId);

      res.status(201).json({
        success: true,
        message: isFullPayment ? "Full payoff completed. Case settled." : "Partial payment credited successfully.",
        data: {
          case: casesDb[caseIdx],
          receipt,
          version: caseVersionsDb[caseId]
        }
      });

    } catch (err: any) {
      // Transaction Rollback logic
      casesDb[caseIdx] = oldCaseState;
      // restore ledger balances
      for (let i = 0; i < ledgerAccountsDb.length; i++) {
        ledgerAccountsDb[i].balance = oldLedgerState[i].balance;
      }
      rollbackLogsDb.push({
        id: `rb-pay-${Date.now()}`,
        caseId,
        reason: err.message,
        timestamp: new Date().toISOString()
      });
      StructuredLogger.error(`[ROLLBACK] Payment failed. State reverted. Detail: ${err.message}`, req.correlationId);

      res.status(500).json({
        error: "TRANSACTION_FAILED",
        message: `Payment registration failed. Transaction safely rolled back. Reason: ${err.message}`
      });
    }
  }
);

// =========================================================================
// 3. CASE REALLOCATION, REALLOCATION ENGINE & CASE TRANSFERS
// =========================================================================

/**
 * POST: Execute formal Case Transfer (With checks and timeline audits)
 */
router.post(
  "/cases/:id/transfer",
  authorizePermission([UserRole.TEAM_LEADER, UserRole.BRANCH_MANAGER, UserRole.RECOVERY_HEAD]),
  async (req: any, res: Response) => {
    const caseId = req.params.id;
    const { fromExecutiveId, toExecutiveId, reason } = req.body;

    if (!fromExecutiveId || !toExecutiveId || !reason) {
      return res.status(400).json({
        error: "VALIDATION_FAILED",
        message: "Missing parameter fields. fromExecutiveId, toExecutiveId, and reason are required."
      });
    }

    const caseIdx = casesDb.findIndex((c) => c.id === caseId && !c.isDeleted);
    if (caseIdx === -1) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Recovery case not found." });
    }

    const debtCase = casesDb[caseIdx];

    // Business validations
    if (debtCase.allocatedExecutiveId !== fromExecutiveId) {
      return res.status(400).json({
        error: "INVALID_TRANSFER_ORIGIN",
        message: "Business validation failed: The case is not currently allocated to the source executive."
      });
    }

    const fromEmp = employeesDb.find((e) => e.id === fromExecutiveId);
    const toEmp = employeesDb.find((e) => e.id === toExecutiveId);

    if (!fromEmp || !toEmp) {
      return res.status(404).json({ error: "EMPLOYEE_NOT_FOUND", message: "Source or Target executive profile not found." });
    }

    if (toEmp.status !== "ACTIVE") {
      return res.status(400).json({
        error: "INACTIVE_TARGET_EXECUTIVE",
        message: "Target executive is not active. Case transfer aborted."
      });
    }

    // Execute case transfer
    casesDb[caseIdx].allocatedExecutiveId = toExecutiveId;
    casesDb[caseIdx].updatedAt = new Date();

    // Timeline update
    timelinesDb.push({
      id: `time-${Date.now()}`,
      caseId,
      eventTitle: "Case Transferred",
      details: `Transferred from ${fromEmp.firstName} ${fromEmp.lastName} to ${toEmp.firstName} ${toEmp.lastName}. Reason: ${reason}`,
      eventType: "ALLOCATION",
      occurredAt: new Date().toISOString()
    });

    StructuredLogger.info(`[WORKFLOW] Case ${caseId} transferred to executive ${toExecutiveId}`, req.correlationId);

    res.json({
      success: true,
      message: "Case assignment successfully transferred.",
      data: casesDb[caseIdx]
    });
  }
);

// =========================================================================
// 4. PROMISE TO PAY (PTP) & REMINDER ENGINE WORKFLOW
// =========================================================================

/**
 * POST: Create/Register Promise To Pay (PTP) with validation
 */
router.post(
  "/cases/:id/ptp",
  authorizePermission([UserRole.RECOVERY_EXECUTIVE, UserRole.TEAM_LEADER]),
  async (req: any, res: Response) => {
    const caseId = req.params.id;
    const { ptpAmount, ptpDate, notes } = req.body;

    if (!ptpAmount || !ptpDate || !notes) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "ptpAmount, ptpDate, and notes are required." });
    }

    const caseIdx = casesDb.findIndex((c) => c.id === caseId && !c.isDeleted);
    if (caseIdx === -1) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Case not found." });
    }

    const debtCase = casesDb[caseIdx];

    // Validation rules
    const selectedDate = new Date(ptpDate);
    if (isNaN(selectedDate.getTime()) || selectedDate.getTime() < Date.now()) {
      return res.status(400).json({
        error: "INVALID_PTP_DATE",
        message: "Date validation failed: Promise To Pay date must be set in the future."
      });
    }

    if (ptpAmount > debtCase.outstandingAmount) {
      return res.status(400).json({
        error: "LIMIT_EXCEEDED",
        message: `PTP amount ($${ptpAmount}) cannot exceed outstanding debt balance ($${debtCase.outstandingAmount}).`
      });
    }

    // Register Call log representing PTP agreement
    teleCallsDb.push({
      id: `ptp-call-${Date.now()}`,
      caseId,
      callerId: req.operator.id,
      callStartTime: new Date().toISOString(),
      callEndTime: new Date().toISOString(),
      disposition: "PROMISE_TO_PAY",
      notes: `PTP registered: Promised $${ptpAmount} on ${ptpDate}. ${notes}`,
      recordingUrl: "https://voice-vault.edros.net/rec/ptp_auth.wav",
      ptpAmount: Number(ptpAmount),
      ptpDate
    });

    // Append alert reminders
    remindersDb.push({
      id: `rem-${Date.now()}`,
      caseId,
      debtorName: debtCase.debtorName,
      executiveId: debtCase.allocatedExecutiveId || req.operator.id,
      reminderType: "PTP_DUE",
      reminderDate: new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day before
      notes: `Follow-up: Promised payment of $${ptpAmount} due tomorrow for debtor ${debtCase.debtorName}`,
      status: "PENDING"
    });

    // Update case stage
    casesDb[caseIdx].stage = "STAGE_2_TELE_CALLING";
    casesDb[caseIdx].updatedAt = new Date();

    timelinesDb.push({
      id: `time-${Date.now()}`,
      caseId,
      eventTitle: "Promise To Pay (PTP) Registered",
      details: `Promised $${ptpAmount} on ${ptpDate}. Follow-up reminder scheduled.`,
      eventType: "CALL",
      occurredAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: "Promise To Pay registered. Automated reminder engine scheduled.",
      data: debtCase
    });
  }
);

// =========================================================================
// 5. LEGAL ESCALATION, SARFAESI FILING & ASSET AUCTION WORKFLOWS
// =========================================================================

/**
 * POST: Escalate Case to Legal stage
 */
router.post(
  "/cases/:id/escalate",
  authorizePermission([UserRole.TEAM_LEADER, UserRole.BRANCH_MANAGER, UserRole.RECOVERY_HEAD, UserRole.LEGAL_COUNSEL]),
  async (req: any, res: Response) => {
    const caseId = req.params.id;
    const { nextStage, reason } = req.body; // nextStage: STAGE_4_LEGAL_NOTICE or STAGE_5_LITIGATION

    if (!nextStage || !reason) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "nextStage and escalation reason are required." });
    }

    if (!["STAGE_4_LEGAL_NOTICE", "STAGE_5_LITIGATION"].includes(nextStage)) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "Invalid escalation target stage." });
    }

    const caseIdx = casesDb.findIndex((c) => c.id === caseId && !c.isDeleted);
    if (caseIdx === -1) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Case not found." });
    }

    casesDb[caseIdx].stage = nextStage;
    casesDb[caseIdx].updatedAt = new Date();

    timelinesDb.push({
      id: `time-${Date.now()}`,
      caseId,
      eventTitle: nextStage === "STAGE_4_LEGAL_NOTICE" ? "Escalated to Legal Notice" : "Filing Litigations",
      details: `Docket escalated. Reason: ${reason}. Actioned by: ${req.operator.email}`,
      eventType: "LEGAL_NOTICE",
      occurredAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: "Case successfully escalated to the legal department.",
      data: casesDb[caseIdx]
    });
  }
);

/**
 * GET: List all SARFAESI enforcement records
 */
router.get(
  "/sarfaesi",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.LEGAL_COUNSEL, UserRole.RECOVERY_HEAD]),
  async (req: any, res: Response) => {
    res.json({ success: true, count: sarfaesiDb.length, data: sarfaesiDb });
  }
);

/**
 * POST: File a SARFAESI Section 13(2) enforcements
 */
router.post(
  "/sarfaesi",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.LEGAL_COUNSEL]),
  async (req: any, res: Response) => {
    const { caseId, assetDetails, estimatedValuation } = req.body;

    if (!caseId || !assetDetails || !estimatedValuation) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "caseId, assetDetails, and estimatedValuation are required." });
    }

    const caseIdx = casesDb.findIndex((c) => c.id === caseId);
    if (caseIdx === -1) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Case file not found." });
    }

    const debtCase = casesDb[caseIdx];

    const sarfaesi: SarfaesiRecord = {
      id: `sarf-${Date.now()}`,
      caseId,
      debtorName: debtCase.debtorName,
      sec13_2NoticeDate: new Date().toISOString(),
      assetDetails,
      estimatedValuation: Number(estimatedValuation),
      status: "NOTICE_ISSUED",
      createdAt: new Date().toISOString()
    };

    sarfaesiDb.push(sarfaesi);

    // Escalate Case
    casesDb[caseIdx].stage = "STAGE_5_LITIGATION";

    timelinesDb.push({
      id: `time-${Date.now()}`,
      caseId,
      eventTitle: "SARFAESI Sec 13(2) Notice Filed",
      details: `Enforced secured creditor demand against mortgaged property: ${assetDetails}`,
      eventType: "LEGAL_NOTICE",
      occurredAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: "SARFAESI Sec 13(2) enforcement notice issued and dispatched.",
      data: sarfaesi
    });
  }
);

/**
 * POST: Repossess asset under SARFAESI Section 13(4)
 */
router.post(
  "/sarfaesi/:id/reposses",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.LEGAL_COUNSEL, UserRole.RECOVERY_HEAD]),
  async (req: any, res: Response) => {
    const sarfId = req.params.id;

    const sarfIdx = sarfaesiDb.findIndex((s) => s.id === sarfId);
    if (sarfIdx === -1) {
      return res.status(404).json({ error: "NOT_FOUND", message: "SARFAESI record not found." });
    }

    sarfaesiDb[sarfIdx].status = "ASSET_POSSESSED";
    sarfaesiDb[sarfIdx].sec13_4PossessionDate = new Date().toISOString();

    timelinesDb.push({
      id: `time-${Date.now()}`,
      caseId: sarfaesiDb[sarfIdx].caseId,
      eventTitle: "Secured Asset Repossessed",
      details: `Possession notice under Section 13(4) executed. Asset details: ${sarfaesiDb[sarfIdx].assetDetails}`,
      eventType: "FIELD_VISIT",
      occurredAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: "Physical asset successfully repossessed under Sec 13(4). Ready for auction pipeline.",
      data: sarfaesiDb[sarfIdx]
    });
  }
);

/**
 * GET: List all repossessed asset auctions
 */
router.get(
  "/auctions",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.LEGAL_COUNSEL, UserRole.RECOVERY_HEAD, UserRole.BANK_COMPLIANCE_OFFICER]),
  async (req: any, res: Response) => {
    res.json({ success: true, count: auctionsDb.length, data: auctionsDb });
  }
);

/**
 * POST: Schedule a public Asset Auction
 */
router.post(
  "/auctions",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.LEGAL_COUNSEL]),
  async (req: any, res: Response) => {
    const { sarfaesiId, reservePrice, auctionDate } = req.body;

    if (!sarfaesiId || !reservePrice || !auctionDate) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "sarfaesiId, reservePrice, and auctionDate are required." });
    }

    const sarf = sarfaesiDb.find((s) => s.id === sarfaesiId);
    if (!sarf) {
      return res.status(404).json({ error: "NOT_FOUND", message: "SARFAESI asset record not found." });
    }

    if (sarf.status !== "ASSET_POSSESSED") {
      return res.status(400).json({
        error: "INVALID_STATE",
        message: "Enforcement asset must be physically repossessed before triggering public auctions."
      });
    }

    const auction: AuctionRecord = {
      id: `auc-${Date.now()}`,
      sarfaesiId,
      caseId: sarf.caseId,
      reservePrice: Number(reservePrice),
      auctionDate,
      status: "SCHEDULED",
      bidsHistory: [],
      createdAt: new Date().toISOString()
    };

    auctionsDb.push(auction);

    timelinesDb.push({
      id: `time-${Date.now()}`,
      caseId: sarf.caseId,
      eventTitle: "Public Auction Scheduled",
      details: `Asset reserve price set to $${reservePrice}. Auction Date: ${auctionDate}`,
      eventType: "LEGAL_NOTICE",
      occurredAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: "Public asset auction scheduled successfully.",
      data: auction
    });
  }
);

/**
 * POST: Place bid on active asset auction
 */
router.post(
  "/auctions/:id/bid",
  authorizePermission([UserRole.RECOVERY_EXECUTIVE, UserRole.LEGAL_COUNSEL, UserRole.TEAM_LEADER]),
  async (req: any, res: Response) => {
    const auctionId = req.params.id;
    const { bidder, amount } = req.body;

    if (!bidder || !amount) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "bidder name and bid amount are required." });
    }

    const aucIdx = auctionsDb.findIndex((a) => a.id === auctionId);
    if (aucIdx === -1) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Auction event not found." });
    }

    const auction = auctionsDb[aucIdx];
    if (auction.status === "COMPLETED") {
      return res.status(400).json({ error: "CLOSED", message: "Auction is already completed." });
    }

    const bidVal = Number(amount);
    if (bidVal < auction.reservePrice) {
      return res.status(400).json({
        error: "BID_UNDER_RESERVE",
        message: `Bidding error: Place amount higher than reserve price $${auction.reservePrice}`
      });
    }

    const highest = auction.currentHighestBid || 0;
    if (bidVal <= highest) {
      return res.status(400).json({
        error: "BID_UNDER_HIGHEST",
        message: `Bidding error: Bid must be higher than current highest bid $${highest}`
      });
    }

    auctionsDb[aucIdx].currentHighestBid = bidVal;
    auctionsDb[aucIdx].highestBidder = bidder;
    auctionsDb[aucIdx].status = "ACTIVE";
    auctionsDb[aucIdx].bidsHistory.push({
      bidder,
      amount: bidVal,
      time: new Date().toISOString()
    });

    res.json({
      success: true,
      message: "Bid accepted. Top bidder updated.",
      data: auctionsDb[aucIdx]
    });
  }
);

/**
 * POST: Close auction (Commit recovery settlement payoff)
 */
router.post(
  "/auctions/:id/close",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.LEGAL_COUNSEL]),
  async (req: any, res: Response) => {
    const auctionId = req.params.id;

    const aucIdx = auctionsDb.findIndex((a) => a.id === auctionId);
    if (aucIdx === -1) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Auction not found." });
    }

    const auction = auctionsDb[aucIdx];
    if (auction.status === "COMPLETED") {
      return res.status(400).json({ error: "ALREADY_CLOSED", message: "Auction is already closed." });
    }

    if (!auction.currentHighestBid) {
      auctionsDb[aucIdx].status = "FAILED_NO_BIDS";
      return res.json({ success: true, message: "Auction closed with no bids. Marked as failed.", data: auction });
    }

    // Success payoff
    const recovered = auction.currentHighestBid;
    auctionsDb[aucIdx].status = "COMPLETED";

    // Set SARFAESI status
    const sarfIdx = sarfaesiDb.findIndex((s) => s.id === auction.sarfaesiId);
    if (sarfIdx !== -1) {
      sarfaesiDb[sarfIdx].status = "AUCTIONED";
    }

    // Credit recovery case
    const caseIdx = casesDb.findIndex((c) => c.id === auction.caseId);
    if (caseIdx !== -1) {
      casesDb[caseIdx].outstandingAmount = Math.max(0, casesDb[caseIdx].outstandingAmount - recovered);
      if (casesDb[caseIdx].outstandingAmount === 0) {
        casesDb[caseIdx].stage = "STAGE_6_SETTLED";
        casesDb[caseIdx].status = "SETTLED";
      }
    }

    // Ledger update
    ledgerAccountsDb[0].balance += recovered;
    doubleEntryJournalsDb.push({
      id: `je-auc-${Date.now()}`,
      accountId: ledgerAccountsDb[0].id,
      voucherNumber: `VCH-AUC-${Date.now().toString().slice(-6)}`,
      debitAmount: recovered,
      creditAmount: 0,
      narration: `Auction proceeds. Sec repossessed asset bid sold. Case: ${auction.caseId}`,
      transactionDate: new Date().toISOString()
    });

    timelinesDb.push({
      id: `time-${Date.now()}`,
      caseId: auction.caseId,
      eventTitle: "Auction Completed Succeeded",
      details: `Sold to bidder ${auction.highestBidder} for $${recovered}. outstanding reduced.`,
      eventType: "SETTLEMENT_PROPOSAL",
      occurredAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `Auction successfully closed. Repossessed asset sold. recovered $${recovered}`,
      data: auctionsDb[aucIdx]
    });
  }
);

// =========================================================================
// 6. WORKFLOW SCHEDULER & REAL-TIME ALERTS TICK RUNNER (CRON ENGINE)
// =========================================================================

/**
 * GET: Retrieve active schedulers, alerts, notifications, and reminders
 */
router.get(
  "/scheduler",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.RECOVERY_HEAD]),
  async (req: any, res: Response) => {
    res.json({
      success: true,
      data: {
        activeCronJobs: [
          { id: "cron-1", schedule: "0 9 * * *", jobName: "DAILY_PTP_EXPIRY_CHECK", status: "IDLE" },
          { id: "cron-2", schedule: "0 18 * * *", jobName: "SLA_BREACH_NOTIFIER", status: "IDLE" },
          { id: "cron-3", schedule: "*/5 * * * *", jobName: "REALTIME_GPS_AGGREGATOR", status: "ACTIVE" }
        ],
        pendingReminders: remindersDb,
        notifications: notificationsDb,
        rollbackLogs: rollbackLogsDb
      }
    });
  }
);

/**
 * POST: Tick cron engine manually to evaluate timers & SLA expirations
 */
router.post(
  "/scheduler/tick",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.RECOVERY_HEAD]),
  async (req: any, res: Response) => {
    let triggeredCount = 0;
    const now = new Date();

    // Check PTP due or overdue
    remindersDb.forEach((rem, idx) => {
      if (rem.status === "PENDING" && new Date(rem.reminderDate) <= now) {
        remindersDb[idx].status = "TRIGGERED";
        triggeredCount++;

        // Send alert notification
        notificationsDb.push({
          id: `notif-${Date.now()}-${idx}`,
          title: `ALERT: PTP Followup Due`,
          body: `Overdue check on Debtor ${rem.debtorName}. Details: ${rem.notes}`,
          recipientId: rem.executiveId,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    // Simulated SLA Breach check: Check cases in TELECALLING for more than 30 days without payment
    casesDb.forEach((c) => {
      if (c.stage === "STAGE_2_TELE_CALLING" && c.delinquencyDays > 120 && c.status === "ALLOCATED") {
        const alreadyNotified = notificationsDb.some((n) => n.title.includes("SLA Breach") && n.body.includes(c.id));
        if (!alreadyNotified) {
          notificationsDb.push({
            id: `notif-sla-${Date.now()}-${c.id}`,
            title: "SLA Breach Notification",
            body: `Case ${c.id} (${c.debtorName}) exceeds 120 DPD but remains in Stage 2. Escalate immediately.`,
            recipientRole: UserRole.TEAM_LEADER,
            isRead: false,
            createdAt: new Date().toISOString()
          });
          triggeredCount++;
        }
      }
    });

    res.json({
      success: true,
      message: `Workflow Scheduler Tick completed. Triggered ${triggeredCount} cron processes and alert reminders.`,
      triggeredCount
    });
  }
);

/**
 * GET: Retrieve user alerts list
 */
router.get(
  "/notifications",
  async (req: any, res: Response) => {
    const operator = req.operator;
    // Filter notifications relevant to the operator's role or exact employee ID
    const userNotifs = notificationsDb.filter((n) => {
      if (n.recipientId && n.recipientId !== operator.id) return false;
      if (n.recipientRole && n.recipientRole !== operator.role) return false;
      return true;
    });

    res.json({ success: true, count: userNotifs.length, data: userNotifs });
  }
);

/**
 * POST: Dismiss notification / mark read
 */
router.post(
  "/notifications/:id/read",
  async (req: any, res: Response) => {
    const nid = req.params.id;
    const idx = notificationsDb.findIndex((n) => n.id === nid);
    if (idx !== -1) {
      notificationsDb[idx].isRead = true;
    }
    res.json({ success: true });
  }
);

export default router;
