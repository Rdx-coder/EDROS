/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AsyncLocalStorage } from "node:async_hooks";
import * as Sentry from "@sentry/node";

// Fully correlated enterprise trace context
export interface TraceContext {
  requestId?: string;
  correlationId?: string;
  traceId?: string;
  spanId?: string;
  tenantId?: string;
  userId?: string;
  sessionId?: string;
}

export const traceStore = new AsyncLocalStorage<TraceContext>();

/**
 * Enterprise Structured Logger mimicking Pino
 * Correlates context automatically and formats logs in standardized JSON structures.
 */
export class PinoLogger {
  private static getContext(): TraceContext {
    return traceStore.getStore() || {};
  }

  private static formatLog(
    level: "DEBUG" | "INFO" | "WARN" | "ERROR",
    category: string,
    msg: string,
    meta?: any
  ) {
    const ctx = this.getContext();
    const logObj = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message: msg,
      requestId: ctx.requestId || "REQ-SYSTEM",
      correlationId: ctx.correlationId || "CORR-SYSTEM",
      traceId: ctx.traceId || "TR-SYSTEM",
      spanId: ctx.spanId || "SP-SYSTEM",
      tenantId: ctx.tenantId || "tenant-system",
      userId: ctx.userId || "user-system",
      sessionId: ctx.sessionId || "sess-system",
      metadata: meta ? this.sanitizeMeta(meta) : undefined,
    };
    return JSON.stringify(logObj);
  }

  private static sanitizeMeta(meta: any): any {
    if (!meta || typeof meta !== "object") return meta;
    if (meta instanceof Error) {
      return {
        name: meta.name,
        message: meta.message,
        stack: meta.stack,
      };
    }
    const sanitized = { ...meta };
    const sensitiveKeys = ["password", "token", "ssn", "cardNumber", "secret", "cvv", "passwordHash"];
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.includes(key)) {
        sanitized[key] = "[REDACTED_SENSITIVE]";
      } else if (typeof sanitized[key] === "object") {
        sanitized[key] = this.sanitizeMeta(sanitized[key]);
      }
    }
    return sanitized;
  }

  // Standard logging endpoints
  public static info(msg: string, meta?: any) {
    console.log(this.formatLog("INFO", "GENERAL", msg, meta));
  }

  public static warn(msg: string, meta?: any) {
    console.warn(this.formatLog("WARN", "GENERAL", msg, meta));
  }

  public static error(msg: string, meta?: any) {
    console.error(this.formatLog("ERROR", "GENERAL", msg, meta));
    // Automatic error reporting to Sentry
    if (meta instanceof Error) {
      Sentry.captureException(meta);
    } else if (meta) {
      Sentry.captureException(new Error(msg), { extra: meta });
    } else {
      Sentry.captureException(new Error(msg));
    }
  }

  public static debug(msg: string, meta?: any) {
    if (process.env.LOG_LEVEL === "DEBUG" || process.env.NODE_ENV !== "production") {
      console.log(this.formatLog("DEBUG", "GENERAL", msg, meta));
    }
  }

  // ==============================================================================
  // SPECIALIZED AUDIT & SYSTEM SUB-LOGGERS
  // ==============================================================================

  public static request(msg: string, meta?: any) {
    console.log(this.formatLog("INFO", "HTTP_REQUEST", msg, meta));
  }

  public static response(msg: string, meta?: any) {
    console.log(this.formatLog("INFO", "HTTP_RESPONSE", msg, meta));
  }

  public static db(msg: string, meta?: any) {
    console.log(this.formatLog("INFO", "DATABASE_QUERY", msg, meta));
  }

  public static worker(msg: string, meta?: any) {
    console.log(this.formatLog("INFO", "WORKER_OPERATION", msg, meta));
  }

  public static auth(msg: string, meta?: any) {
    console.log(this.formatLog("INFO", "AUTHENTICATION", msg, meta));
  }

  public static audit(msg: string, meta?: any) {
    console.log(this.formatLog("INFO", "AUDIT_LEDGER", msg, meta));
  }

  public static security(msg: string, meta?: any) {
    const level = (meta?.severity === "CRITICAL" || meta?.severity === "HIGH") ? "WARN" : "INFO";
    console.log(this.formatLog(level, "SECURITY_VIOLATION", msg, meta));
  }

  public static performance(msg: string, meta?: any) {
    console.log(this.formatLog("INFO", "PERFORMANCE_PROFILE", msg, meta));
  }

  public static exception(msg: string, err: Error, meta?: any) {
    console.error(this.formatLog("ERROR", "UNHANDLED_EXCEPTION", `${msg}: ${err.message}`, {
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      ...meta,
    }));
    // Explicit Sentry recording
    Sentry.captureException(err, { extra: meta });
  }
}
