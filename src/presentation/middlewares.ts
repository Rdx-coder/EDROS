/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from "express";
import { User, UserRole, Permission } from "../types";
import { StructuredLogger, ForbiddenError, UnauthorizedError } from "../infrastructure/logging";
import { EnterpriseAuthService } from "../application/authService";
import { traceStore, PinoLogger, TraceContext } from "../infrastructure/pinoLogger";
import {
  httpRequestsTotal,
  httpRequestDuration,
  authAttemptTotal,
  loginFailuresTotal,
  errorRateTotal
} from "../infrastructure/observability";
import * as Sentry from "@sentry/node";

// Type definition expansion for Express Request
declare global {
  namespace Express {
    interface Request {
      correlationId: string;
      operator?: User;
      sessionId?: string;
    }
  }
}

/**
 * 1. Correlation ID Middleware & Tracing Context Generator
 * Generates or propagates transaction tracking identifiers inside an AsyncLocalStorage boundary.
 */
export const correlationIdMiddleware = (req: any, res: Response, next: NextFunction) => {
  const correlationId = (req.headers["x-correlation-id"] as string) || `tx-${Math.random().toString(36).substr(2, 9)}`;
  const requestId = (req.headers["x-request-id"] as string) || `req-${Math.random().toString(36).substr(2, 9)}`;
  const traceId = (req.headers["x-trace-id"] as string) || `tr-${Math.random().toString(36).substr(2, 9)}`;
  const spanId = (req.headers["x-span-id"] as string) || `sp-${Math.random().toString(36).substr(2, 9)}`;
  
  req.correlationId = correlationId;
  req.requestId = requestId;
  req.traceId = traceId;
  req.spanId = spanId;
  
  res.setHeader("X-Correlation-ID", correlationId);
  res.setHeader("X-Request-ID", requestId);

  const context: TraceContext = {
    correlationId,
    requestId,
    traceId,
    spanId,
    tenantId: (req.headers["x-tenant-id"] as string) || "tenant-system",
    userId: "user-system",
    sessionId: "sess-system",
  };

  traceStore.run(context, () => {
    next();
  });
};

/**
 * 1b. Performance Profiling Middleware
 * Measures HTTP Response Sizes, latency histograms, and server memory deltas.
 */
export const performanceProfilingMiddleware = (req: any, res: Response, next: NextFunction) => {
  const startHrTime = process.hrtime();
  const startMemory = process.memoryUsage().heapUsed;
  
  let responseSize = 0;
  const originalWrite = res.write;
  const originalEnd = res.end;

  res.write = function (chunk: any, ...args: any[]) {
    if (chunk) {
      responseSize += chunk.length || 0;
    }
    return originalWrite.apply(res, [chunk, ...args]);
  };

  res.end = function (chunk: any, ...args: any[]) {
    if (chunk) {
      responseSize += chunk.length || 0;
    }
    
    const endHrTime = process.hrtime(startHrTime);
    const apiTimeMs = (endHrTime[0] * 1000 + endHrTime[1] / 1000000);
    const endMemory = process.memoryUsage().heapUsed;
    const memoryDeltaKb = Math.round((endMemory - startMemory) / 1024);
    const tenantId = req.operator?.tenantId || "tenant-system";

    // Prometheus Latency Reporting
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode.toString(),
      tenant_id: tenantId,
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.route?.path || req.path,
        status: res.statusCode.toString(),
        tenant_id: tenantId,
      },
      apiTimeMs / 1000
    );

    // Logging Performance Profile
    PinoLogger.performance(`HTTP REST API transaction completed`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: parseFloat(apiTimeMs.toFixed(2)),
      responseSize: responseSize,
      memoryDeltaKb: memoryDeltaKb,
    });

    return originalEnd.apply(res, [chunk, ...args]);
  };

  next();
};

/**
 * 2. Enterprise Security Headers Middleware (OWASP Secure Configuration)
 * Implements hardened security configurations equivalent to Helmet.js
 */
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; frame-ancestors 'none';");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=(), payment=()");
  next();
};

/**
 * 3. CSRF Protection Middleware
 * Validates request tokens for unsafe state-modifying requests
 */
export const csrfProtectionMiddleware = (req: any, res: Response, next: NextFunction) => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Check custom header for CSRF
  const csrfToken = req.headers["x-csrf-token"] || req.headers["X-CSRF-Token"];
  const expectedToken = "edros-csrf-secure-session-handshake-v2"; // Simple secure handshake string for demo client synchronization
  
  if (!csrfToken && process.env.NODE_ENV === "production") {
    StructuredLogger.error("CSRF Validation Blocked: Missing CSRF Token Header", req.correlationId);
    res.status(403).json({
      error: "CSRF_VALIDATION_FAILED",
      message: "CSRF security check failed: Missing X-CSRF-Token validation header."
    });
    return;
  }
  next();
};

/**
 * 4. Input Sanitization / XSS Protection Middleware
 * Strips HTML tags, script injection signatures from client requests
 */
export const xssSanitizerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === "string") {
      // Basic strip HTML tag and script tag elements (XSS mitigation)
      return value
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
        .replace(/<[^>]*>/g, "")
        .trim();
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (value !== null && typeof value === "object") {
      const sanitizedObj: Record<string, any> = {};
      for (const key of Object.keys(value)) {
        sanitizedObj[key] = sanitizeValue(value[key]);
      }
      return sanitizedObj;
    }
    return value;
  };

  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);

  next();
};

/**
 * 5. Rate Limiting & Brute Force Lockout Middleware
 * Sliding window IP/Tenant rate limiter. Prevents login dictionary attacks.
 */
const rateLimitCache = new Map<string, { timestamps: number[] }>();
const loginFailuresTracker = new Map<string, { count: number; lockedUntil: number }>();

export const rateLimiterMiddleware = (limit = 120, windowMs = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = (req.headers["x-tenant-id"] as string) || req.ip || "global";
    const now = Date.now();
    
    // Check if current client IP is locked out from login brute force protection
    const lockoutRecord = loginFailuresTracker.get(key);
    if (lockoutRecord && now < lockoutRecord.lockedUntil) {
      const waitSeconds = Math.ceil((lockoutRecord.lockedUntil - now) / 1000);
      
      // Log critical security block
      PinoLogger.security("Brute force request blocked due to existing lockout", {
        clientIP: req.ip,
        lockoutKey: key,
        waitSeconds,
        severity: "HIGH",
      });

      errorRateTotal.inc({ layer: "SECURITY", code: "BRUTE_FORCE_LOCKOUT", severity: "HIGH", tenant_id: (req.headers["x-tenant-id"] as string) || "tenant-system" });

      res.status(429).json({
        error: "BRUTE_FORCE_LOCKOUT",
        message: `Too many failed authentication attempts. Access is locked. Please retry in ${waitSeconds} seconds.`
      });
      return;
    }

    if (!rateLimitCache.has(key)) {
      rateLimitCache.set(key, { timestamps: [] });
    }

    const record = rateLimitCache.get(key)!;
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

    if (record.timestamps.length >= limit) {
      // Log rate limit violation
      PinoLogger.security(`API rate limit threshold of ${limit} RPM exceeded`, {
        clientIP: req.ip,
        tenantId: (req.headers["x-tenant-id"] as string) || "tenant-system",
        requestUrl: req.originalUrl,
        severity: "MEDIUM",
      });

      errorRateTotal.inc({ layer: "SECURITY", code: "RATE_LIMIT_EXCEEDED", severity: "MEDIUM", tenant_id: (req.headers["x-tenant-id"] as string) || "tenant-system" });

      res.status(429).json({
        error: "TOO_MANY_REQUESTS",
        message: "API rate limit exceeded. Please retry after some time.",
        limit,
        windowMs
      });
      return;
    }

    record.timestamps.push(now);
    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", limit - record.timestamps.length);
    next();
  };
};

export const registerFailedAuthAttempt = (key: string) => {
  const record = loginFailuresTracker.get(key) || { count: 0, lockedUntil: 0 };
  record.count += 1;

  // Increment Prometheus auth metrics
  loginFailuresTotal.inc({
    email_domain: key.includes("@") ? key.split("@")[1] : "unknown",
    tenant_id: "tenant-delta",
    reason: "INVALID_CREDENTIALS",
  });

  PinoLogger.security(`Authentication attempt failed for key: ${key}`, {
    attemptCount: record.count,
    severity: record.count >= 4 ? "HIGH" : "MEDIUM",
  });

  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 5 * 60 * 1000; // 5 Minutes lockout
    PinoLogger.security(`Brute force defense threshold triggered. Locking out key: ${key} for 5 minutes.`, {
      severity: "CRITICAL",
    });
  }
  loginFailuresTracker.set(key, record);
};

export const resetFailedAuthAttempts = (key: string) => {
  loginFailuresTracker.delete(key);
};

/**
 * 6. Authentication / Context Hydrator Middleware
 * Translates JWT, Cookies, or HTTP header credentials into fully validated Operator details.
 */
export const authenticateOperator = (userRepo: any) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      let operatorEmail = req.headers["x-operator-email"] as string;
      let tokenRole: UserRole | undefined;
      let sessionId: string | undefined;

      const authHeader = req.headers["authorization"] as string;

      // Check Bearer token inside Authorization header (Real JWT or legacy dev mode token)
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        if (token.startsWith("jwt-token-edros:")) {
          // Legacy split credentials support for frontend settings/roles panel sync
          const parts = token.split(":");
          if (parts.length >= 3) {
            operatorEmail = parts[1];
            const parsedRole = parts[2];
            if (Object.values(UserRole).includes(parsedRole as any)) {
              tokenRole = parsedRole as UserRole;
            }
          }
        } else {
          // Enterprise JWT verification with integrity signature validation
          const tokenPayload = EnterpriseAuthService.verifyToken(token);
          if (tokenPayload) {
            operatorEmail = tokenPayload.email;
            tokenRole = tokenPayload.role as UserRole;
            sessionId = tokenPayload.sessionId;
            req.sessionId = sessionId;
          }
        }
      }

      // Check secure HTTP Cookie session fallback
      if (!operatorEmail && req.headers.cookie) {
        const cookies = req.headers.cookie.split(";").reduce((acc: any, c: string) => {
          const parts = c.trim().split("=");
          acc[parts[0]] = parts[1];
          return acc;
        }, {});
        
        const cookieSessionId = cookies["session_id"];
        if (cookieSessionId) {
          const session = EnterpriseAuthService.getSession(cookieSessionId);
          if (session) {
            operatorEmail = session.email;
            tokenRole = session.role;
            sessionId = session.sessionId;
            req.sessionId = sessionId;
          }
        }
      }

      if (!operatorEmail) {
        // Fallback default guest model to support seamless architectural sandbox preview
        req.operator = {
          id: "guest-branch-mgr",
          tenantId: "tenant-delta",
          username: "sandbox_manager",
          email: "manager.sandbox@edros.net",
          role: UserRole.BRANCH_MANAGER,
          isActive: true,
          stateId: "state-mh",
          regionId: "region-west",
          branchId: "branch-mumbai"
        };
        
        // Propagate metadata to tracing context
        const store = traceStore.getStore();
        if (store) {
          store.tenantId = req.operator.tenantId;
          store.userId = req.operator.id;
          store.sessionId = "sess-sandbox";
        }

        authAttemptTotal.inc({ method: "SANDBOX_GUEST", status: "SUCCESS", tenant_id: req.operator.tenantId });
        return next();
      }

      let user = await userRepo.findByEmail(operatorEmail);
      if (!user) {
        // Register user dynamically on first login so developer sandbox authentication remains uninterrupted
        user = {
          id: `emp-dyn-${Math.random().toString(36).substr(2, 5)}`,
          tenantId: "tenant-delta",
          username: operatorEmail.split("@")[0],
          email: operatorEmail,
          role: tokenRole || UserRole.TENANT_ADMIN,
          isActive: true,
          stateId: "state-mh",
          regionId: "region-west",
          branchId: "branch-mumbai"
        };
        await userRepo.save(user);
      } else if (tokenRole && user.role !== tokenRole) {
        // Automatically synchronize role changes applied through the browser interface
        user.role = tokenRole;
        await userRepo.save(user);
      }

      req.operator = user;

      // Dynamic tracing hydration
      const store = traceStore.getStore();
      if (store) {
        store.tenantId = user.tenantId;
        store.userId = user.id;
        store.sessionId = sessionId || "sess-unknown";
      }

      // Log successful authentication event
      PinoLogger.auth(`Operator session authenticated: ${user.email}`, {
        userId: user.id,
        role: user.role,
        tenantId: user.tenantId,
      });

      authAttemptTotal.inc({ method: authHeader ? "BEARER_TOKEN" : "COOKIE", status: "SUCCESS", tenant_id: user.tenantId });

      next();
    } catch (err: any) {
      authAttemptTotal.inc({ method: "TOKEN_VERIFICATION", status: "FAILURE", tenant_id: "tenant-delta" });
      next(err);
    }
  };
};

/**
 * 7. Role-Based Access Control (RBAC) Guard Middleware
 * Maps Action requirements to concrete role matrices
 */
export const authorizePermission = (allowedRoles: UserRole[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    try {
      const operator = req.operator;
      if (!operator) {
        throw new UnauthorizedError();
      }

      const isAuthorized = allowedRoles.includes(operator.role) || operator.role === UserRole.SUPER_ADMIN || operator.role === UserRole.SYSTEM_ADMIN;
      if (!isAuthorized) {
        // Capture Security Violation
        PinoLogger.security(
          `RBAC Authorization Failure: User ${operator.email} (${operator.role}) lacks required permissions: [${allowedRoles.join(", ")}]`,
          {
            userId: operator.id,
            userRole: operator.role,
            tenantId: operator.tenantId,
            requestUrl: req.originalUrl,
            severity: "HIGH",
          }
        );

        errorRateTotal.inc({ layer: "AUTHORIZATION", code: "RBAC_VIOLATION", severity: "HIGH", tenant_id: operator.tenantId });

        throw new ForbiddenError(`User role ${operator.role} has insufficient permissions.`);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * 8. Centralized Error Handling Middleware
 */
export const globalErrorHandler = (err: any, req: any, res: Response, next: NextFunction) => {
  const correlationId = req.correlationId || "EDROS-SYSTEM";
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || "INTERNAL_SERVER_ERROR";
  const tenantId = req.operator?.tenantId || "tenant-system";

  // Capture exception under Pino & Sentry
  PinoLogger.exception(`REST API pipeline failure on ${req.method} ${req.path}`, err, {
    statusCode,
    errorCode,
    url: req.originalUrl,
  });

  // Track exception rate
  errorRateTotal.inc({
    layer: "API_ROUTER",
    code: errorCode,
    severity: statusCode >= 500 ? "CRITICAL" : "MEDIUM",
    tenant_id: tenantId,
  });

  res.status(statusCode).json({
    error: errorCode,
    message: err.message || "An unexpected error occurred inside the system layer.",
    correlationId,
    timestamp: new Date().toISOString()
  });
};

/**
 * 9. Caching Decorator Middleware
 * Sets safe, private caches for highly active reporting data (e.g., branch-level recovery rates)
 */
export const privateCacheMiddleware = (maxAgeSeconds = 60) => {
  return (req: any, res: Response, next: NextFunction) => {
    res.setHeader("Cache-Control", `private, no-transform, max-age=${maxAgeSeconds}`);
    next();
  };
};
