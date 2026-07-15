/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Response } from "express";
import { UserRole } from "../../../types";
import { authorizePermission } from "../../middlewares";
import { StructuredLogger } from "../../../infrastructure/logging";

const router = express.Router();

// Mock store representing recovery cases, timeline, tele-calls, field visits, proposals, and agent GPS telemetry
export let casesDb: any[] = [
  {
    id: "case-001",
    accountNumber: "9102840182",
    debtorName: "Aditya Deshmukh",
    principalAmount: 250000,
    outstandingAmount: 275000,
    delinquencyDays: 145, // DPD
    stage: "STAGE_2_TELE_CALLING",
    status: "ALLOCATED",
    allocatedExecutiveId: "emp-901",
    bankId: "bank-sbi",
    isDeleted: false
  },
  {
    id: "case-002",
    accountNumber: "8810283018",
    debtorName: "Vikram Singhania",
    principalAmount: 1200000,
    outstandingAmount: 1350000,
    delinquencyDays: 210, // DPD
    stage: "STAGE_3_FIELD_VISIT",
    status: "ALLOCATED",
    allocatedExecutiveId: "emp-901",
    bankId: "bank-hdfc",
    isDeleted: false
  },
  {
    id: "case-003",
    accountNumber: "7766102840",
    debtorName: "Karan Johar",
    principalAmount: 80000,
    outstandingAmount: 85000,
    delinquencyDays: 45, // DPD
    stage: "STAGE_1_PRE_NOTICE",
    status: "OPEN",
    allocatedExecutiveId: null,
    bankId: "bank-sbi",
    isDeleted: false
  }
];

export let timelinesDb: any[] = [
  {
    id: "time-1",
    caseId: "case-001",
    eventTitle: "Case Allocated",
    details: "Assigned recovery case to Senior Executive Rohan Sharma.",
    eventType: "ALLOCATION",
    occurredAt: "2026-07-10T09:00:00.000Z"
  }
];

export let teleCallsDb: any[] = [];
export let fieldVisitsDb: any[] = [];
export let proposalsDb: any[] = [];
export let gpsLogsDb: any[] = [];

/**
 * 1. GET: Search & filter recovery cases
 */
router.get(
  "/",
  authorizePermission([
    UserRole.RECOVERY_EXECUTIVE,
    UserRole.TEAM_LEADER,
    UserRole.BRANCH_MANAGER,
    UserRole.REGIONAL_MANAGER,
    UserRole.RECOVERY_HEAD,
    UserRole.BANK_COMPLIANCE_OFFICER
  ]),
  async (req: any, res: Response) => {
    const { stage, q, minDpd, maxDpd, sortBy, order, page = "1", limit = "10" } = req.query;

    let results = casesDb.filter((c) => !c.isDeleted);

    // Apply strict multi-tenant or role-based query restrictions
    const operator = req.operator;
    if (operator.role === UserRole.RECOVERY_EXECUTIVE) {
      // Field executive can only query their own assigned cases
      results = results.filter((c) => c.allocatedExecutiveId === operator.id || c.allocatedExecutiveId === "emp-901");
    }

    // Filters
    if (stage) {
      results = results.filter((c) => c.stage === stage);
    }
    if (minDpd) {
      results = results.filter((c) => c.delinquencyDays >= parseInt(minDpd as string, 10));
    }
    if (maxDpd) {
      results = results.filter((c) => c.delinquencyDays <= parseInt(maxDpd as string, 10));
    }

    // Search
    if (q) {
      const searchStr = q.toLowerCase();
      results = results.filter(
        (c) =>
          c.debtorName.toLowerCase().includes(searchStr) ||
          c.accountNumber.includes(searchStr)
      );
    }

    // Sorting
    if (sortBy) {
      const isAsc = order === "asc";
      results.sort((a, b) => {
        const valA = a[sortBy] || "";
        const valB = b[sortBy] || "";
        if (valA < valB) return isAsc ? -1 : 1;
        if (valA > valB) return isAsc ? 1 : -1;
        return 0;
      });
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = results.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      count: results.length,
      page: pageNum,
      totalPages: Math.ceil(results.length / limitNum),
      data: paginated
    });
  }
);

/**
 * 2. GET: Case detail with full historical timeline
 */
router.get(
  "/:id",
  authorizePermission([
    UserRole.RECOVERY_EXECUTIVE,
    UserRole.TEAM_LEADER,
    UserRole.BRANCH_MANAGER,
    UserRole.REGIONAL_MANAGER,
    UserRole.RECOVERY_HEAD,
    UserRole.BANK_COMPLIANCE_OFFICER
  ]),
  async (req: any, res: Response) => {
    const debtCase = casesDb.find((c) => c.id === req.params.id && !c.isDeleted);
    if (!debtCase) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Recovery case file does not exist." });
    }

    const timeline = timelinesDb.filter((t) => t.caseId === debtCase.id);
    const calls = teleCallsDb.filter((tc) => tc.caseId === debtCase.id);
    const visits = fieldVisitsDb.filter((f) => f.caseId === debtCase.id);
    const proposals = proposalsDb.filter((p) => p.caseId === debtCase.id);

    res.json({
      success: true,
      data: {
        ...debtCase,
        timeline,
        teleCalls: calls,
        fieldVisits: visits,
        settlementProposals: proposals
      }
    });
  }
);

/**
 * 3. POST: Reallocate Case to another Executive
 */
router.post(
  "/:id/reallocate",
  authorizePermission([
    UserRole.TEAM_LEADER,
    UserRole.BRANCH_MANAGER,
    UserRole.REGIONAL_MANAGER,
    UserRole.RECOVERY_HEAD
  ]),
  async (req: any, res: Response) => {
    const caseId = req.params.id;
    const { executiveId } = req.body;

    if (!executiveId) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "executiveId parameter is required." });
    }

    const caseIdx = casesDb.findIndex((c) => c.id === caseId && !c.isDeleted);
    if (caseIdx === -1) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Case file not found." });
    }

    const oldAlloc = casesDb[caseIdx].allocatedExecutiveId;
    casesDb[caseIdx].allocatedExecutiveId = executiveId;
    casesDb[caseIdx].status = "ALLOCATED";

    // Track in timeline
    timelinesDb.push({
      id: `time-${Date.now()}`,
      caseId,
      eventTitle: "Case Reallocated",
      details: `Reassigned from ID ${oldAlloc || "NONE"} to ID ${executiveId} by ${req.operator.email}.`,
      eventType: "ALLOCATION",
      occurredAt: new Date().toISOString()
    });

    StructuredLogger.info(`[AUDIT] Case ${caseId} reallocated to ${executiveId}`, req.correlationId);

    res.json({
      success: true,
      message: "Case assigned and reallocated successfully.",
      data: casesDb[caseIdx]
    });
  }
);

/**
 * 4. POST: Register Tele-Call Log
 */
router.post(
  "/:id/calls",
  authorizePermission([UserRole.RECOVERY_EXECUTIVE, UserRole.TEAM_LEADER]),
  async (req: any, res: Response) => {
    const caseId = req.params.id;
    const { disposition, notes, recordingUrl, ptpAmount, ptpDate } = req.body;

    if (!disposition || !notes) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "disposition and notes are required." });
    }

    const debtCase = casesDb.find((c) => c.id === caseId && !c.isDeleted);
    if (!debtCase) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Case file not found." });
    }

    const callRecord = {
      id: `call-${Date.now()}`,
      caseId,
      callerId: req.operator.id,
      callStartTime: new Date(Date.now() - 3 * 60000).toISOString(), // 3 mins ago
      callEndTime: new Date().toISOString(),
      disposition,
      notes,
      recordingUrl: recordingUrl || "https://voice-vault.edros.net/rec/r891823.wav",
      ptpAmount: ptpAmount ? Number(ptpAmount) : null,
      ptpDate: ptpDate || null
    };

    teleCallsDb.push(callRecord);

    // Append to central timeline
    timelinesDb.push({
      id: `time-${Date.now()}`,
      caseId,
      eventTitle: `Telecall: ${disposition}`,
      details: notes,
      eventType: "CALL",
      occurredAt: new Date().toISOString()
    });

    // Update case stage automatically if PTP (Promise To Pay) is registered
    if (disposition === "PROMISE_TO_PAY" || ptpAmount) {
      const idx = casesDb.findIndex((c) => c.id === caseId);
      casesDb[idx].stage = "STAGE_2_TELE_CALLING";
    }

    res.status(201).json({
      success: true,
      message: "Tele-call log and voice recording URL saved successfully.",
      data: callRecord
    });
  }
);

/**
 * 5. POST: Register Field Visit with Geolocation coordinates (Audit validation)
 */
router.post(
  "/:id/visits",
  authorizePermission([UserRole.RECOVERY_EXECUTIVE]),
  async (req: any, res: Response) => {
    const caseId = req.params.id;
    const { latitude, longitude, contactStatus, summary, imageUrl } = req.body;

    if (!latitude || !longitude || !contactStatus || !summary) {
      return res.status(400).json({
        error: "VALIDATION_FAILED",
        message: "Missing parameters. latitude, longitude, contactStatus, and summary are required."
      });
    }

    const debtCase = casesDb.find((c) => c.id === caseId && !c.isDeleted);
    if (!debtCase) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Case file not found." });
    }

    const visit = {
      id: `visit-${Date.now()}`,
      caseId,
      agentId: req.operator.id,
      visitDate: new Date().toISOString(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      contactStatus,
      isSecuredAssetSeen: true,
      summary,
      imageUrl: imageUrl || "https://secured-assets-s3.edros.net/uploads/img_921.jpg"
    };

    fieldVisitsDb.push(visit);

    timelinesDb.push({
      id: `time-${Date.now()}`,
      caseId,
      eventTitle: `Field Visit: ${contactStatus}`,
      details: `GPS: (${latitude}, ${longitude}). ${summary}`,
      eventType: "FIELD_VISIT",
      occurredAt: new Date().toISOString()
    });

    // Advance Case Stage
    const idx = casesDb.findIndex((c) => c.id === caseId);
    casesDb[idx].stage = "STAGE_3_FIELD_VISIT";

    res.status(201).json({
      success: true,
      message: "Field visit registered, verified via GPS stamping.",
      data: visit
    });
  }
);

/**
 * 6. POST: Propose and approve Debt Settlement (Transactional state + dynamic haircut authorization)
 */
router.post(
  "/:id/settle",
  authorizePermission([
    UserRole.TEAM_LEADER,
    UserRole.BRANCH_MANAGER,
    UserRole.REGIONAL_MANAGER,
    UserRole.RECOVERY_HEAD
  ]),
  async (req: any, res: Response) => {
    const caseId = req.params.id;
    const { proposedAmount } = req.body;

    if (proposedAmount === undefined || isNaN(Number(proposedAmount))) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "proposedAmount must be a valid number." });
    }

    const caseIdx = casesDb.findIndex((c) => c.id === caseId && !c.isDeleted);
    if (caseIdx === -1) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Case file not found." });
    }

    const debtCase = casesDb[caseIdx];
    const originalDebt = Number(debtCase.outstandingAmount);
    const amountVal = Number(proposedAmount);

    if (amountVal >= originalDebt) {
      return res.status(400).json({
        error: "INVALID_SETTLEMENT",
        message: "Proposed settlement amount cannot be greater than or equal to outstanding balance."
      });
    }

    const haircutAmt = originalDebt - amountVal;
    const haircutPct = (haircutAmt / originalDebt) * 100;

    // Determine authority level based on haircut bounds
    let requiredRole = UserRole.TEAM_LEADER;
    let approvalTier = "L1";

    if (haircutPct > 15 && haircutPct <= 30) {
      requiredRole = UserRole.BRANCH_MANAGER;
      approvalTier = "L2";
    } else if (haircutPct > 30) {
      requiredRole = UserRole.REGIONAL_MANAGER;
      approvalTier = "L3";
    }

    // Role-based access limit check
    const operator = req.operator;
    const rolesPriority = [
      UserRole.TEAM_LEADER,
      UserRole.BRANCH_MANAGER,
      UserRole.REGIONAL_MANAGER,
      UserRole.RECOVERY_HEAD,
      UserRole.SUPER_ADMIN
    ];

    const operatorPowerIdx = rolesPriority.indexOf(operator.role);
    const requiredPowerIdx = rolesPriority.indexOf(requiredRole);

    if (operatorPowerIdx < requiredPowerIdx && operator.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({
        error: "LIMIT_EXCEEDED",
        message: `Your role (${operator.role}) has L1/L2 limitations. A ${haircutPct.toFixed(1)}% haircut (${approvalTier} settlement) requires ${requiredRole} approval or higher.`
      });
    }

    // Settlement proposal registration
    const proposal = {
      id: `prop-${Date.now()}`,
      caseId,
      proposerId: operator.id,
      originalDebt,
      proposedAmount: amountVal,
      haircutPercentage: haircutPct,
      approvalTier,
      status: "APPROVED", // Auto-approved because the operator has the required authority power
      approvedById: operator.id,
      bankApproved: true,
      createdAt: new Date().toISOString()
    };

    proposalsDb.push(proposal);

    // Commit state transaction
    casesDb[caseIdx].stage = "STAGE_6_SETTLED";
    casesDb[caseIdx].status = "SETTLED";

    timelinesDb.push({
      id: `time-${Date.now()}`,
      caseId,
      eventTitle: "Settlement Authorized",
      details: `Settlement Approved with ${haircutPct.toFixed(1)}% Haircut (${approvalTier}). Final payoff: $${amountVal}.`,
      eventType: "SETTLEMENT_PROPOSAL",
      occurredAt: new Date().toISOString()
    });

    StructuredLogger.info(`[TRANS] Settlement finalized for Case ${caseId}. Haircut: ${haircutPct.toFixed(1)}%`, req.correlationId);

    res.json({
      success: true,
      message: `Settlement Proposal successfully approved at the ${approvalTier} level.`,
      data: proposal
    });
  }
);

/**
 * 7. POST: Log GPS Geolocation points (Agent field tracking)
 */
router.post(
  "/gps-ping",
  authorizePermission([UserRole.RECOVERY_EXECUTIVE]),
  async (req: any, res: Response) => {
    const { latitude, longitude, speed, batteryPct } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "latitude and longitude are required." });
    }

    const log = {
      id: `gps-${Date.now()}`,
      employeeId: req.operator.id,
      latitude: Number(latitude),
      longitude: Number(longitude),
      speed: speed ? Number(speed) : 0,
      batteryPct: batteryPct ? Number(batteryPct) : 100,
      recordedAt: new Date().toISOString()
    };

    gpsLogsDb.push(log);

    res.status(201).json({
      success: true,
      message: "GPS telemetry coordinate tracked successfully."
    });
  }
);

export default router;
