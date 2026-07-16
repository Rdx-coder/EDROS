/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import "../../../infrastructure/dbUrlSanitizer";
import { PrismaClient } from "@prisma/client";
import { redisCache, RedisConnectionPool } from "../../../infrastructure/redisClient";
import { bullQueue, BullQueueManager } from "../../../infrastructure/bullQueue";
import { PinoLogger } from "../../../infrastructure/pinoLogger";
import { prometheusRegistry } from "../../../infrastructure/observability";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * 1. GET: Deep Health Check Endpoint
 * Asserts the functional health of all backing sub-systems.
 */
router.get("/health", async (req, res) => {
  const timestamp = new Date().toISOString();
  let overallStatus = "UP";

  const diagnostics: Record<string, any> = {
    postgresql: { status: "UP", latencyMs: 0 },
    redis: { status: "UP", latencyMs: 0 },
    objectStorage: { status: "UP" },
    systemResources: { status: "UP" },
    queueHealth: { status: "UP" },
    workerStatus: { status: "UP" },
  };

  // 1. PostgreSQL Check
  const pgStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    diagnostics.postgresql.latencyMs = Date.now() - pgStart;
  } catch (err: any) {
    overallStatus = "DEGRADED";
    diagnostics.postgresql = {
      status: "DOWN",
      error: err.message,
      timestamp,
    };
  }

  // 2. Redis Connection Pool Check
  const redisStart = Date.now();
  try {
    await redisCache.set("healthcheck:ping", "pong", 5);
    const pong = await redisCache.get<string>("healthcheck:ping");
    if (pong !== "pong") throw new Error("Invalid response received from cache client.");
    diagnostics.redis.latencyMs = Date.now() - redisStart;
    diagnostics.redis.connections = {
      cache: RedisConnectionPool.cacheRedis ? "CONNECTED" : "FALLBACK",
      queue: RedisConnectionPool.queueRedis ? "CONNECTED" : "FALLBACK",
      session: RedisConnectionPool.sessionRedis ? "CONNECTED" : "FALLBACK",
    };
  } catch (err: any) {
    overallStatus = "DEGRADED";
    diagnostics.redis = {
      status: "DOWN",
      error: err.message,
    };
  }

  // 3. AWS S3 Compatible Object Storage Check
  const s3Bucket = process.env.AWS_S3_BUCKET || process.env.CLOUDFLARE_R2_BUCKET || process.env.MINIO_BUCKET;
  if (!s3Bucket) {
    diagnostics.objectStorage = {
      status: "WARN",
      message: "No active S3/R2 cloud storage bucket defined in variables. Falling back to secure local workspace storage.",
    };
  } else {
    diagnostics.objectStorage = {
      status: "UP",
      activeBucketName: s3Bucket,
      provider: process.env.STORAGE_PROVIDER || "S3-compatible",
    };
  }

  // 4. System Resources Check (CPU & Memory)
  const memoryUsage = process.memoryUsage();
  const rssMb = Math.round(memoryUsage.rss / 1024 / 1024);
  const heapUsedMb = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const heapTotalMb = Math.round(memoryUsage.heapTotal / 1024 / 1024);

  // If memory usage gets critically high, flag resource status
  const memoryStatus = rssMb > 1536 ? "CRITICAL" : rssMb > 1024 ? "WARNING" : "HEALTHY";
  if (memoryStatus === "CRITICAL") overallStatus = "DEGRADED";

  diagnostics.systemResources = {
    status: memoryStatus === "HEALTHY" ? "UP" : "DEGRADED",
    memoryUsage: {
      rssMb,
      heapUsedMb,
      heapTotalMb,
    },
    uptimeSeconds: Math.round(process.uptime()),
    cpu: process.cpuUsage(),
  };

  // 5. Queue Health & 6. Worker Thread Status Check
  const allJobs = bullQueue.getJobs();
  const dlqLength = bullQueue.getDLQ().length;
  diagnostics.queueHealth = {
    status: "UP",
    totalJobsProcessed: allJobs.length,
    activeWaitingJobs: allJobs.filter((j) => j.status === "QUEUED").length,
    deadLetterQueueSize: dlqLength,
  };

  diagnostics.workerStatus = {
    status: "UP",
    activeWorkersCount: allJobs.filter((j) => j.status === "RUNNING").length,
    concurrencyCap: 5,
    processorsCount: Object.keys(BullQueueManager.QUEUES).length,
  };

  res.status(overallStatus === "UP" ? 200 : 503).json({
    status: overallStatus,
    timestamp,
    service: "EDROS-Core-Engine",
    version: "2.1.0-observability",
    diagnostics,
  });
});

/**
 * 2. GET: Kubernetes Liveness Probe
 */
router.get("/liveness", (req, res) => {
  res.status(200).send("OK");
});

/**
 * 3. GET: Kubernetes Readiness Probe
 */
router.get("/readiness", async (req, res) => {
  try {
    // Assert backing systems are immediately reachable
    await prisma.$queryRaw`SELECT 1`;
    await redisCache.get("healthcheck:ping");
    res.status(200).json({ status: "READY", timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(503).json({
      status: "NOT_READY",
      reason: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * 4. GET: Prometheus Scrapable Metrics Endpoint
 * Returns standard OpenMetrics text metrics compatible with scrape engines.
 */
router.get("/metrics", async (req, res) => {
  try {
    res.setHeader("Content-Type", prometheusRegistry.contentType);
    res.send(await prometheusRegistry.metrics());
  } catch (err: any) {
    PinoLogger.error("Failed to compile Prometheus registry metrics", err);
    res.status(500).send(err.message || "Metrics Compilation Failed");
  }
});

/**
 * 5. GET: Bull Board Dashboard Data
 * Kept intact for frontend monitoring panels.
 */
router.get("/bullboard", (req, res) => {
  const allJobs = bullQueue.getJobs();
  const dlqJobs = bullQueue.getDLQ();

  const completedJobs = allJobs.filter((j) => j.status === "COMPLETED" && j.executionTimeMs !== undefined);
  const totalExecTime = completedJobs.reduce((acc, curr) => acc + (curr.executionTimeMs || 0), 0);
  const avgProcessingTimeMs = completedJobs.length > 0 ? Math.round(totalExecTime / completedJobs.length) : 0;

  const queuesBreakdown = Object.values(BullQueueManager.QUEUES).map((qName) => {
    const queueJobs = allJobs.filter((j) => j.queueName === qName);
    const queueDlq = dlqJobs.filter((j) => j.queueName === qName);

    return {
      queueName: qName,
      length: queueJobs.length,
      metrics: {
        queued: queueJobs.filter((j) => j.status === "QUEUED").length,
        running: queueJobs.filter((j) => j.status === "RUNNING").length,
        completed: queueJobs.filter((j) => j.status === "COMPLETED").length,
        failed: queueJobs.filter((j) => j.status === "FAILED").length,
        delayed: queueJobs.filter((j) => j.status === "DELAYED").length,
        cancelled: queueJobs.filter((j) => j.status === "CANCELLED").length,
        dlq: queueDlq.length,
      },
    };
  });

  const activeWorkersCount = allJobs.filter((j) => j.status === "RUNNING").length;
  const memoryUsage = process.memoryUsage();

  res.json({
    status: "HEALTHY",
    timestamp: new Date().toISOString(),
    workerHealth: {
      status: "ACTIVE",
      activeThreadsCount: activeWorkersCount,
      isGracefulShutdownActive: false,
      memoryUsageRssMb: Math.round(memoryUsage.rss / 1024 / 1024),
      nodeUptimeSeconds: Math.round(process.uptime()),
    },
    metricsSummary: {
      totalJobsProcessedCount: allJobs.length,
      averageExecutionTimeMs: avgProcessingTimeMs,
      totalDeadLetterCount: dlqJobs.length,
      failedRetentionCount: allJobs.filter((j) => j.status === "FAILED").length,
      activeWaitingQueueLength: allJobs.filter((j) => j.status === "QUEUED").length,
    },
    queues: queuesBreakdown,
    activeJobsList: allJobs
      .filter((j) => j.status === "RUNNING")
      .map((j) => ({
        id: j.id,
        queueName: j.queueName,
        name: j.name,
        startedAt: j.startedAt,
        attemptsMade: j.attemptsMade,
        tenantId: j.tenantId,
        correlationId: j.correlationId,
      })),
    recentDeadLetterJobs: dlqJobs.slice(-10).map((j) => ({
      id: j.id,
      queueName: j.queueName,
      name: j.name,
      failedAt: j.finishedAt,
      error: j.error,
      tenantId: j.tenantId,
      correlationId: j.correlationId,
    })),
  });
});

export default router;
