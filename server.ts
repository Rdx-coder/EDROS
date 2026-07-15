/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// EDROS Core Architecture Imports
import { UserRole } from "./src/types";
import { DIContainer, DebtRecoveryUseCase } from "./src/application/services";
import {
  PrismaDebtCaseRepository as InMemoryDebtCaseRepository,
  PrismaUserRepository as InMemoryUserRepository,
  PrismaAuditLogRepository as InMemoryAuditLogRepository
} from "./src/infrastructure/repositories";
import { StructuredLogger } from "./src/infrastructure/logging";
import {
  correlationIdMiddleware,
  performanceProfilingMiddleware,
  securityHeadersMiddleware,
  rateLimiterMiddleware,
  csrfProtectionMiddleware,
  xssSanitizerMiddleware,
  authenticateOperator,
  authorizePermission,
  privateCacheMiddleware,
  globalErrorHandler
} from "./src/presentation/middlewares";
import apiV2Router from "./src/presentation/routes/v2/index";
import { initializeSentry } from "./src/infrastructure/observability";

async function startServer() {
  // Initialize Sentry right at the start of container execution
  initializeSentry();

  const app = express();
  const PORT = 3000;

  // 1. Dependency Injection Configuration
  const debtRepo = new InMemoryDebtCaseRepository();
  const userRepo = new InMemoryUserRepository();
  const auditRepo = new InMemoryAuditLogRepository();

  DIContainer.register("IDebtCaseRepository", debtRepo);
  DIContainer.register("IUserRepository", userRepo);
  DIContainer.register("IAuditLogRepository", auditRepo);

  const recoveryUseCase = new DebtRecoveryUseCase(debtRepo, userRepo, auditRepo);
  DIContainer.register("DebtRecoveryUseCase", recoveryUseCase);

  StructuredLogger.info("EDROS Clean Architecture Dependency Injection Container initialized successfully.");

  // 2. Global Presentation Middlewares
  app.use(express.json());
  app.use(correlationIdMiddleware);
  app.use(performanceProfilingMiddleware);
  app.use(securityHeadersMiddleware);
  app.use(csrfProtectionMiddleware);
  app.use(xssSanitizerMiddleware);
  app.use(rateLimiterMiddleware(120, 60000)); // Rate limit of 120 RPM

  // 3. Versioned REST API Routes (API v1)
  const apiRouter = express.Router();

  // Context hydrator: populates req.operator based on header email
  apiRouter.use(authenticateOperator(userRepo));

  // GET: Health & Telemetry Endpoint
  apiRouter.get("/health", (req, res) => {
    res.json({
      status: "UP",
      timestamp: new Date().toISOString(),
      engine: "EDROS Core",
      version: "1.0.0-release",
      diContainerReady: true,
      isolationTenant: (req as any).operator?.tenantId || "default"
    });
  });

  // GET: Search cases (Branch Managers, Regional Managers, Recovery Heads, Executives)
  apiRouter.get(
    "/cases",
    authorizePermission([
      UserRole.RECOVERY_EXECUTIVE,
      UserRole.TEAM_LEADER,
      UserRole.BRANCH_MANAGER,
      UserRole.REGIONAL_MANAGER,
      UserRole.RECOVERY_HEAD
    ]),
    privateCacheMiddleware(10), // Safe 10s caching for listings
    async (req: any, res: Response, next) => {
      try {
        const stage = req.query.stage as string;
        const minDpd = req.query.minDpd ? parseInt(req.query.minDpd as string) : undefined;
        const results = await debtRepo.searchCases(req.operator.tenantId, { stage, minDpd });
        res.json({ success: true, count: results.length, data: results });
      } catch (err) {
        next(err);
      }
    }
  );

  // POST: Reallocate Case (Only Team Leads, Branch/Regional Managers and Recovery Heads)
  apiRouter.post(
    "/cases/:id/reallocate",
    authorizePermission([
      UserRole.TEAM_LEADER,
      UserRole.BRANCH_MANAGER,
      UserRole.REGIONAL_MANAGER,
      UserRole.RECOVERY_HEAD
    ]),
    async (req: any, res: Response, next) => {
      try {
        const caseId = req.params.id;
        const { executiveId } = req.body;
        if (!executiveId) {
          return res.status(400).json({ error: "BAD_REQUEST", message: "executiveId is required." });
        }
        const updatedCase = await recoveryUseCase.allocateCase(
          caseId,
          executiveId,
          req.operator,
          req.correlationId
        );
        res.json({ success: true, message: "Case allocated successfully.", data: updatedCase });
      } catch (err) {
        next(err);
      }
    }
  );

  // POST: Propose Settlement (Dynamic Authorization Cap L1/L2/L3)
  apiRouter.post(
    "/cases/:id/settle",
    authorizePermission([
      UserRole.TEAM_LEADER,
      UserRole.BRANCH_MANAGER,
      UserRole.REGIONAL_MANAGER,
      UserRole.RECOVERY_HEAD
    ]),
    async (req: any, res: Response, next) => {
      try {
        const caseId = req.params.id;
        const { settlementAmount } = req.body;
        if (settlementAmount === undefined || typeof settlementAmount !== "number") {
          return res.status(400).json({ error: "BAD_REQUEST", message: "settlementAmount must be a valid number." });
        }
        const updatedCase = await recoveryUseCase.approveSettlement(
          caseId,
          settlementAmount,
          req.operator,
          req.correlationId
        );
        res.json({ success: true, message: "Settlement authorized.", data: updatedCase });
      } catch (err) {
        next(err);
      }
    }
  );

  // GET: Fetch Audit logs for compliance (Super Admin, Tenant Admin, Bank Compliance Officer)
  apiRouter.get(
    "/audit-logs",
    authorizePermission([
      UserRole.SUPER_ADMIN,
      UserRole.TENANT_ADMIN,
      UserRole.BANK_COMPLIANCE_OFFICER
    ]),
    async (req: any, res: Response, next) => {
      try {
        const logs = await auditRepo.findByTenantId(req.operator.tenantId);
        res.json({ success: true, data: logs });
      } catch (err) {
        next(err);
      }
    }
  );

  // Register versioned api route bundle
  app.use("/api/v1", apiRouter);
  app.use("/api/v2", authenticateOperator(userRepo), apiV2Router);

  // 4. Centralized Error Handling Pipeline
  app.use(globalErrorHandler);

  // 5. Client Bundle Delivery (Vite Integration)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 6. Listener Bindings
  app.listen(PORT, "0.0.0.0", () => {
    StructuredLogger.info(`EDROS Enterprise API Node successfully running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
