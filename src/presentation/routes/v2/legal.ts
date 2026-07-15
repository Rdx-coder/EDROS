/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Response } from "express";
import { UserRole } from "../../../types";
import { authorizePermission } from "../../middlewares";
import { StructuredLogger } from "../../../infrastructure/logging";

const router = express.Router();

// Mock store representing legal templates, notice records, litigation cases, hearings, and adjournments
export let legalTemplatesDb: any[] = [
  { id: "tmpl-01", title: "Section 138 Dishonor of Cheque", noticeType: "SEC_138", bodyText: "You are hereby notified that Cheque No {{cheque_no}} has been returned unpaid..." },
  { id: "tmpl-02", title: "SARFAESI Section 13(2) Demand", noticeType: "SARFAESI_SEC_13_2", bodyText: "As a secured creditor under SARFAESI Act, we hereby demand payoff of..." }
];

export let legalNoticesDb: any[] = [
  {
    id: "not-401",
    caseId: "case-001",
    templateId: "tmpl-01",
    noticeRefNo: "N-2026-90281-01",
    dispatchedDate: "2026-07-02T10:00:00.000Z",
    receivedDate: null,
    noticeStatus: "DISPATCHED",
    courierTrackingNo: "SPEEDPOST-IN-90281"
  }
];

export let litigationCasesDb: any[] = [
  {
    id: "lit-501",
    noticeId: "not-401",
    suitNumber: "O.S. 90281/2026",
    courtName: "Debt Recovery Tribunal-I (Mumbai)",
    filingDate: "2026-07-10T11:00:00.000Z",
    nextHearingDate: "2026-08-15T10:30:00.000Z",
    suitStatus: "FILED",
    natureOfSuit: "CIVIL_RECOVERY_DEBT",
    decreeAmount: null,
    decreeDate: null
  }
];

export let courtHearingsDb: any[] = [
  {
    id: "hrg-601",
    litigationCaseId: "lit-501",
    hearingDate: "2026-08-15T10:30:00.000Z",
    judgeNotes: null,
    counselPresent: true,
    hearingStatus: "SCHEDULED"
  }
];

export let caseAdjournmentsDb: any[] = [];

/**
 * 1. GET: Retrieve all active litigation cases
 */
router.get(
  "/cases",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.LEGAL_COUNSEL, UserRole.RECOVERY_HEAD]),
  async (req: any, res: Response) => {
    res.json({ success: true, count: litigationCasesDb.length, data: litigationCasesDb });
  }
);

/**
 * 2. POST: File new Litigation Case (Court suit)
 */
router.post(
  "/cases",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.LEGAL_COUNSEL]),
  async (req: any, res: Response) => {
    const { noticeId, suitNumber, courtName, filingDate, natureOfSuit } = req.body;

    if (!suitNumber || !courtName || !filingDate || !natureOfSuit) {
      return res.status(400).json({
        error: "VALIDATION_FAILED",
        message: "Missing parameters. suitNumber, courtName, filingDate, and natureOfSuit are required."
      });
    }

    const newLit = {
      id: `lit-${Date.now()}`,
      noticeId: noticeId || null,
      suitNumber,
      courtName,
      filingDate,
      nextHearingDate: null,
      suitStatus: "FILED",
      natureOfSuit,
      decreeAmount: null,
      decreeDate: null
    };

    litigationCasesDb.push(newLit);

    StructuredLogger.info(`[LEGAL] Filed court suit ${suitNumber} at ${courtName}`, req.correlationId);

    res.status(201).json({
      success: true,
      message: "Litigation case dockets created and filed successfully.",
      data: newLit
    });
  }
);

/**
 * 3. GET: Fetch legal notices dispatch history
 */
router.get(
  "/notices",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.LEGAL_COUNSEL, UserRole.RECOVERY_HEAD]),
  async (req: any, res: Response) => {
    res.json({ success: true, count: legalNoticesDb.length, data: legalNoticesDb });
  }
);

/**
 * 4. POST: Dispatch Legal Notice (Validation + template generation)
 */
router.post(
  "/notices",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.LEGAL_COUNSEL]),
  async (req: any, res: Response) => {
    const { caseId, templateId, noticeRefNo, courierTrackingNo } = req.body;

    if (!caseId || !templateId || !noticeRefNo) {
      return res.status(400).json({
        error: "VALIDATION_FAILED",
        message: "caseId, templateId, and noticeRefNo are required."
      });
    }

    const template = legalTemplatesDb.find((t) => t.id === templateId);
    if (!template) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Notice template not found." });
    }

    const notice = {
      id: `not-${Date.now()}`,
      caseId,
      templateId,
      noticeRefNo,
      dispatchedDate: new Date().toISOString(),
      receivedDate: null,
      noticeStatus: "DISPATCHED",
      courierTrackingNo: courierTrackingNo || "N/A"
    };

    legalNoticesDb.push(notice);

    StructuredLogger.info(`[LEGAL] Generated and Dispatched Notice Ref: ${noticeRefNo}`, req.correlationId);

    res.status(201).json({
      success: true,
      message: "Legal notice drafted and dispatched successfully.",
      data: notice
    });
  }
);

/**
 * 5. POST: Register Court Hearing Date
 */
router.post(
  "/cases/:id/hearings",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.LEGAL_COUNSEL]),
  async (req: any, res: Response) => {
    const litigationCaseId = req.params.id;
    const { hearingDate } = req.body;

    if (!hearingDate) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "hearingDate is required." });
    }

    const litIdx = litigationCasesDb.findIndex((l) => l.id === litigationCaseId);
    if (litIdx === -1) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Litigation case dockets not found." });
    }

    const hearing = {
      id: `hrg-${Date.now()}`,
      litigationCaseId,
      hearingDate,
      judgeNotes: null,
      counselPresent: true,
      hearingStatus: "SCHEDULED"
    };

    courtHearingsDb.push(hearing);

    // Update case hearing date
    litigationCasesDb[litIdx].nextHearingDate = hearingDate;

    res.status(201).json({
      success: true,
      message: "Court hearing schedule docketed successfully.",
      data: hearing
    });
  }
);

/**
 * 6. POST: Adjourn Court Hearing
 */
router.post(
  "/hearings/:id/adjourn",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.LEGAL_COUNSEL]),
  async (req: any, res: Response) => {
    const hearingId = req.params.id;
    const { reasonCode, extendedDate, notes } = req.body;

    if (!reasonCode || !extendedDate) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "reasonCode and extendedDate are required." });
    }

    const hrgIdx = courtHearingsDb.findIndex((h) => h.id === hearingId);
    if (hrgIdx === -1) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Hearing record not found." });
    }

    courtHearingsDb[hrgIdx].hearingStatus = "ADJOURNED";
    courtHearingsDb[hrgIdx].judgeNotes = `Adjourned: ${reasonCode}. Next date: ${extendedDate}. ${notes || ""}`;

    const adj = {
      id: `adj-${Date.now()}`,
      hearingId,
      reasonCode,
      extendedDate,
      notes: notes || "No additional logs.",
      createdAt: new Date().toISOString()
    };

    caseAdjournmentsDb.push(adj);

    // Sync next hearing date in litigation dockets
    const caseId = courtHearingsDb[hrgIdx].litigationCaseId;
    const litIdx = litigationCasesDb.findIndex((l) => l.id === caseId);
    if (litIdx !== -1) {
      litigationCasesDb[litIdx].nextHearingDate = extendedDate;
    }

    StructuredLogger.info(`[LEGAL] Court hearing ${hearingId} adjourned to ${extendedDate}`, req.correlationId);

    res.status(201).json({
      success: true,
      message: "Hearing adjourned successfully, case scheduler synchronized.",
      data: adj
    });
  }
);

export default router;
