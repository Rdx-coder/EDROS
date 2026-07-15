/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import client from "prom-client";
import * as Sentry from "@sentry/node";
import { PinoLogger } from "./pinoLogger";

// Create a custom Prometheus Registry for enterprise segregation
export const prometheusRegistry = new client.Registry();

// Enable default system/CPU/Memory metrics
client.collectDefaultMetrics({ register: prometheusRegistry });

// ==============================================================================
// PROMETHEUS METRIC DEFINITIONS
// ==============================================================================

// 1. HTTP Requests Counter
export const httpRequestsTotal = new client.Counter({
  name: "edros_http_requests_total",
  help: "Total number of HTTP requests processed by EDROS core engine",
  labelNames: ["method", "route", "status", "tenant_id"],
  registers: [prometheusRegistry],
});

// 2. HTTP Request Duration Histogram
export const httpRequestDuration = new client.Histogram({
  name: "edros_http_request_duration_seconds",
  help: "HTTP request duration latency buckets in seconds",
  labelNames: ["method", "route", "status", "tenant_id"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [prometheusRegistry],
});

// 3. API Latency Histogram
export const apiLatency = new client.Histogram({
  name: "edros_api_latency_seconds",
  help: "Custom REST API operation execution time inside functional handlers",
  labelNames: ["endpoint", "operation", "tenant_id"],
  buckets: [0.005, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 3],
  registers: [prometheusRegistry],
});

// 4. Error Rate Counter
export const errorRateTotal = new client.Counter({
  name: "edros_error_rate_total",
  help: "Total errors thrown segregated by layer, code, and severity",
  labelNames: ["layer", "code", "severity", "tenant_id"],
  registers: [prometheusRegistry],
});

// 5. Worker Execution Time Histogram
export const workerExecutionDuration = new client.Histogram({
  name: "edros_worker_execution_seconds",
  help: "Distributed queue worker job processing execution latency",
  labelNames: ["queue_name", "job_name", "status"],
  buckets: [0.05, 0.2, 0.5, 1, 2, 5, 10, 30],
  registers: [prometheusRegistry],
});

// 6. Database Query Execution Time Histogram
export const dbQueryTime = new client.Histogram({
  name: "edros_db_query_seconds",
  help: "PostgreSQL query execution times measured from Prisma interceptors",
  labelNames: ["query_type", "table", "operation"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1.5],
  registers: [prometheusRegistry],
});

// 7. Redis Cache Operation Latency
export const redisLatency = new client.Histogram({
  name: "edros_redis_latency_seconds",
  help: "Redis cache read, write, and invalidation roundtrip times",
  labelNames: ["operation", "status"],
  buckets: [0.0005, 0.002, 0.005, 0.01, 0.025, 0.05, 0.1],
  registers: [prometheusRegistry],
});

// 8. Background Queue Length Gauges
export const queueLengthGauge = new client.Gauge({
  name: "edros_queue_length_total",
  help: "Active lengths of custom BullMQ background workers",
  labelNames: ["queue_name", "status"],
  registers: [prometheusRegistry],
});

// 9. Background Job Success Rate
export const jobSuccessRateTotal = new client.Counter({
  name: "edros_job_success_rate_total",
  help: "Aggregated background task worker successful completions",
  labelNames: ["queue_name", "job_name"],
  registers: [prometheusRegistry],
});

// 10. Background Job Failure Rate
export const jobFailureRateTotal = new client.Counter({
  name: "edros_job_failure_rate_total",
  help: "Aggregated background task worker failures with exception categorization",
  labelNames: ["queue_name", "job_name", "error_code"],
  registers: [prometheusRegistry],
});

// 11. Authentication Attempt Rate
export const authAttemptTotal = new client.Counter({
  name: "edros_auth_attempts_total",
  help: "Total login authentication events tracked globally",
  labelNames: ["method", "status", "tenant_id"],
  registers: [prometheusRegistry],
});

// 12. Security Login Failures
export const loginFailuresTotal = new client.Counter({
  name: "edros_login_failures_total",
  help: "Suspicious invalid authentication password attempts",
  labelNames: ["email_domain", "tenant_id", "reason"],
  registers: [prometheusRegistry],
});

// 13. System Memory Gauges
export const memoryUsageBytes = new client.Gauge({
  name: "edros_memory_usage_bytes",
  help: "Total resident set size (RSS) memory consumption in bytes",
  registers: [prometheusRegistry],
});

export const heapUsageBytes = new client.Gauge({
  name: "edros_heap_usage_bytes",
  help: "Node runtime total heap memory utilization in bytes",
  labelNames: ["type"], // total, used
  registers: [prometheusRegistry],
});

// 14. CPU Usage Ratio Gauge
export const cpuUsageGauge = new client.Gauge({
  name: "edros_cpu_usage_ratio",
  help: "Node system CPU usage ratio calculated from user & system ticks",
  labelNames: ["type"], // user, system
  registers: [prometheusRegistry],
});

// 15. Garbage Collection Simulation Duration
export const gcDurationSeconds = new client.Histogram({
  name: "edros_gc_duration_seconds",
  help: "Simulated garbage collection sweep time and memory reclamation",
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1],
  registers: [prometheusRegistry],
});

// 16. Open DB/Redis Network Connections Gauge
export const openConnectionsGauge = new client.Gauge({
  name: "edros_open_connections_count",
  help: "Currently registered open network connections to dependent engines",
  labelNames: ["target_service"], // postgresql, redis, storage
  registers: [prometheusRegistry],
});

// ==============================================================================
// APM & SENTRY INITIALIZATION
// ==============================================================================

export function initializeSentry() {
  const dsn = process.env.SENTRY_DSN || "https://7243950cfca84824b26c7e29b1bead76@o4500000000000000.ingest.sentry.io/4500000000000000";
  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: 1.0,
    });
    PinoLogger.info("Sentry instrumentation initialized successfully in EDROS.");
  } catch (err) {
    PinoLogger.error("Failed to construct Sentry diagnostic client", err);
  }
}

// Ensure background worker sweeps gauges every 10 seconds
setInterval(() => {
  const mem = process.memoryUsage();
  memoryUsageBytes.set(mem.rss);
  heapUsageBytes.set({ type: "total" }, mem.heapTotal);
  heapUsageBytes.set({ type: "used" }, mem.heapUsed);

  const cpu = process.cpuUsage();
  cpuUsageGauge.set({ type: "user" }, cpu.user / 1000000);
  cpuUsageGauge.set({ type: "system" }, cpu.system / 1000000);
}, 10000).unref();

// ==============================================================================
// ENTERPRISE OPENTELEMETRY TRACE & SPAN BUILDER (Distributed Tracing Mock Exporter)
// ==============================================================================
export class Tracer {
  public static startSpan(name: string, parentTraceId?: string) {
    const traceId = parentTraceId || `tr-${Math.random().toString(36).substring(2, 15)}`;
    const spanId = `sp-${Math.random().toString(36).substring(2, 10)}`;
    const startTime = Date.now();

    PinoLogger.info(`[OTel Span Start] Name: "${name}" | Trace: ${traceId} | Span: ${spanId}`);

    return {
      traceId,
      spanId,
      end: (meta?: any) => {
        const duration = Date.now() - startTime;
        PinoLogger.info(
          `[OTel Span End] Name: "${name}" | Trace: ${traceId} | Span: ${spanId} | Duration: ${duration}ms`,
          meta
        );
      },
    };
  }
}
