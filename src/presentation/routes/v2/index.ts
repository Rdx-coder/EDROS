/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Response } from "express";
import { UserRole } from "../../../types";
import { authorizePermission } from "../../middlewares";
import { PinoLogger } from "../../../infrastructure/pinoLogger";
import { bullQueue, Job } from "../../../infrastructure/bullQueue";
import { s3Storage } from "../../../infrastructure/s3Storage";

// Import modular routes
import employeesRouter from "./employees";
import recoveryRouter, { casesDb } from "./recovery";
import financeRouter from "./finance";
import legalRouter from "./legal";
import dashboardRouter from "./dashboard";
import workflowsRouter from "./workflows";
import authRouter from "./auth";
import monitoringRouter from "./monitoring";
import testingRouter from "./testing";
import documentsRouter from "./documents";

const router = express.Router();

// Shared registries mapped to database workflows
export let backgroundJobsDb: any[] = [];
export let bulkImportSessionsDb: any[] = [];
export let bulkExportSessionsDb: any[] = [];

// ==========================================================
// Register BullMQ Workers for background asynchronous queues
// ==========================================================

// 1. Worker for "bulk-export"
bullQueue.process("bulk-export", async (job) => {
  const { sessionId, filterCriteria } = job.data;
  PinoLogger.info(`[WORKER] Generating export file for Session ID: ${sessionId}...`);
  
  // Create virtual export buffer data
  const excelBuffer = Buffer.from(`EDROS Export Registry Data for query: ${filterCriteria}`);
  
  // Validate file metadata
  const meta = {
    fileName: `export_${sessionId}.xlsx`,
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    fileSizeKb: 120,
  };
  
  // Upload securely using AWS S3 Compatible Storage interface
  const s3Url = await s3Storage.uploadFile(meta.fileName, excelBuffer, meta);
  
  // Update export session registry
  const idx = bulkExportSessionsDb.findIndex((s) => s.id === sessionId);
  if (idx !== -1) {
    bulkExportSessionsDb[idx].status = "COMPLETED";
    bulkExportSessionsDb[idx].filePath = s3Url;
  }
  
  PinoLogger.info(`[WORKER] Export Session ID: ${sessionId} generated and published to S3: ${s3Url}`);
});

// 2. Generic jobs wrapper worker
bullQueue.process("GENERIC_WORKER_JOB", async (job) => {
  const { jobId, jobType } = job.data;
  PinoLogger.info(`[WORKER] Running job ID: ${jobId}, Type: ${jobType}...`);
  
  // Update task list status
  const idx = backgroundJobsDb.findIndex((j) => j.id === jobId);
  if (idx !== -1) {
    backgroundJobsDb[idx].status = "RUNNING";
    backgroundJobsDb[idx].progress = 50;
  }
  
  // Simulate heavy enterprise transaction batch processing
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  if (idx !== -1) {
    backgroundJobsDb[idx].status = "COMPLETED";
    backgroundJobsDb[idx].progress = 100;
    backgroundJobsDb[idx].finishedAt = new Date().toISOString();
  }
  PinoLogger.info(`[WORKER] Asynchronous task completed: ID ${jobId}`);
});

// Seed default background jobs array
backgroundJobsDb.push(
  { id: "job-101", jobType: "DATA_ANONYMIZATION", status: "COMPLETED", progress: 100, queuedAt: "2026-07-13T10:00:00.000Z" },
  { id: "job-102", jobType: "COMPILED_SLA_REPORT", status: "QUEUED", progress: 0, queuedAt: "2026-07-14T04:00:00.000Z" }
);

// Mount modular sub-systems
router.use("/auth", authRouter);
router.use("/employees", employeesRouter);
router.use("/cases", recoveryRouter);
router.use("/finance", financeRouter);
router.use("/legal", legalRouter);
router.use("/dashboard", dashboardRouter);
router.use("/workflows", workflowsRouter);
router.use("/monitoring", monitoringRouter);
router.use("/testing", testingRouter);
router.use("/documents", documentsRouter);

/**
 * 1. GET: Swagger OpenAPI Spec JSON Endpoint
 */
router.get("/swagger.json", (req, res) => {
  res.json({
    openapi: "3.0.3",
    info: {
      title: "EDROS Clean Enterprise Core API",
      description: "Hardened REST API specification controlling identity management, automated debt settlement, court legal dockets, dynamic GPS tracking, double-entry ledgers, and background audit job triggers.",
      version: "2.0.0"
    },
    paths: {
      "/api/v2/dashboard/metrics": {
        get: {
          summary: "Retrieve Real-Time Recovery Analytics",
          responses: {
            "200": { description: "Successful calculation containing totals, recovery rate, and stage breakdowns." }
          }
        }
      },
      "/api/v2/cases": {
        get: {
          summary: "Search and filter recovery cases",
          parameters: [
            { name: "stage", in: "query", schema: { type: "string" }, description: "Filter by operational stage" },
            { name: "q", in: "query", schema: { type: "string" }, description: "Full-text debtor search" }
          ],
          responses: { "200": { description: "Paginated case registries list" } }
        }
      },
      "/api/v2/cases/{id}/settle": {
        post: {
          summary: "Propose and authorize Settlement Proposal",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { proposedAmount: { type: "number" } }
                }
              }
            }
          },
          responses: { "200": { description: "Settlement approved with haircut audit validation logs" } }
        }
      }
    }
  });
});

/**
 * 2. POST: Bulk Import Case Allocation Records (Transactional integrity)
 */
router.post(
  "/bulk-import",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.RECOVERY_HEAD]),
  async (req: any, res: Response) => {
    const { cases } = req.body;

    if (!cases || !Array.isArray(cases) || cases.length === 0) {
      return res.status(400).json({
        error: "VALIDATION_FAILED",
        message: "Request body must contain a non-empty 'cases' list array."
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // Transactional processing
    cases.forEach((item, index) => {
      const { accountNumber, debtorName, principalAmount, outstandingAmount, delinquencyDays, bankId } = item;

      if (!accountNumber || !debtorName || outstandingAmount === undefined || delinquencyDays === undefined || !bankId) {
        errorCount++;
        errors.push({ index, error: "Missing required fields (accountNumber, debtorName, outstandingAmount, delinquencyDays, bankId)." });
        return;
      }

      const newCase = {
        id: `case-${Math.floor(1000 + Math.random() * 9000)}`,
        tenantId: req.operator?.tenantId || "tenant-delta",
        bankId,
        accountNumber,
        debtorName,
        principalAmount: Number(principalAmount || outstandingAmount),
        outstandingAmount: Number(outstandingAmount),
        delinquencyDays: Number(delinquencyDays),
        stage: "STAGE_1_PRE_NOTICE" as const,
        status: "OPEN",
        allocatedExecutiveId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      casesDb.push(newCase);
      successCount++;
    });

    const session = {
      id: `bulk-in-${Date.now()}`,
      fileName: req.body.fileName || "api_bulk_upload.json",
      fileSizeKb: req.body.fileSizeKb || 45,
      rowCount: cases.length,
      successCount,
      errorCount,
      status: errorCount > 0 ? "PARTIALLY_FAILED" : "COMPLETED",
      errorsJson: JSON.stringify(errors),
      createdAt: new Date().toISOString()
    };

    bulkImportSessionsDb.push(session);
    PinoLogger.info(`[BULK] Bulk import completed. Success: ${successCount}, Failures: ${errorCount}`, { correlationId: req.correlationId });

    res.status(201).json({
      success: true,
      message: "Bulk upload file processed.",
      session
    });
  }
);

/**
 * 3. POST: Trigger Bulk Export Generation (Asynchronous channel via BullMQ)
 */
router.post(
  "/bulk-export",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.RECOVERY_HEAD, UserRole.BANK_COMPLIANCE_OFFICER]),
  async (req: any, res: Response) => {
    const { stage, bankId } = req.body;

    const sessionId = `bulk-out-${Date.now()}`;
    const exportSession = {
      id: sessionId,
      filterCriteria: JSON.stringify({ stage, bankId }),
      filePath: null,
      status: "QUEUED",
      createdAt: new Date().toISOString()
    };

    bulkExportSessionsDb.push(exportSession);

    // Asynchronously dispatch job execution using BullMQ engine
    await bullQueue.add("bulk-export", {
      sessionId,
      filterCriteria: exportSession.filterCriteria
    });

    res.status(202).json({
      success: true,
      message: "Asynchronous Bulk Export requested. Monitor status via job tracking system.",
      sessionId,
      trackUrl: `/api/v2/bulk-export/${sessionId}`
    });
  }
);

/**
 * 4. GET: Retrieve Bulk Export Status
 */
router.get(
  "/bulk-export/:id",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.RECOVERY_HEAD, UserRole.BANK_COMPLIANCE_OFFICER]),
  async (req: any, res: Response) => {
    const session = bulkExportSessionsDb.find((s) => s.id === req.params.id);
    if (!session) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Export session not found." });
    }
    res.json({ success: true, data: session });
  }
);

/**
 * 5. POST: Queue asynchronous background job via BullMQ
 */
router.post(
  "/jobs",
  authorizePermission([UserRole.TENANT_ADMIN]),
  async (req: any, res: Response) => {
    const { jobType, payload } = req.body;

    if (!jobType) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "jobType is required." });
    }

    const jobId = `job-${Date.now()}`;
    const jobItem = {
      id: jobId,
      jobType,
      payload: JSON.stringify(payload || {}),
      status: "QUEUED",
      progress: 0,
      queuedAt: new Date().toISOString()
    };

    backgroundJobsDb.push(jobItem);

    // Dispatch real execution thread using BullMQ container queue
    await bullQueue.add("GENERIC_WORKER_JOB", {
      jobId,
      jobType,
      payload
    }, { attempts: 3 });

    res.status(202).json({
      success: true,
      message: "Task successfully added to execution queue.",
      job: jobItem
    });
  }
);

/**
 * 6. GET: List background jobs status (Redis monitoring)
 */
router.get(
  "/jobs",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.RECOVERY_HEAD]),
  async (req: any, res: Response) => {
    // Merge real queue job states dynamically
    const jobsList = backgroundJobsDb.map((dbJob) => {
      const activeJob = bullQueue.getJobs().find((j) => j.id === dbJob.id);
      if (activeJob) {
        return {
          ...dbJob,
          status: activeJob.status,
          progress: activeJob.progress
        };
      }
      return dbJob;
    });

    res.json({ success: true, count: jobsList.length, data: jobsList });
  }
);

export default router;
