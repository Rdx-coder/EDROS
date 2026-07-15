/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class EDROSError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: any
  ) {
    super(message);
    this.name = "EDROSError";
  }
}

export class ValidationError extends EDROSError {
  constructor(message: string, details?: any) {
    super("VALIDATION_FAILED", message, 400, details);
  }
}

export class UnauthorizedError extends EDROSError {
  constructor(message = "Unauthorized access token.") {
    super("UNAUTHORIZED_ACCESS", message, 401);
  }
}

export class ForbiddenError extends EDROSError {
  constructor(message = "Access forbidden under Role-Based security parameters.") {
    super("RBAC_FORBIDDEN", message, 403);
  }
}

export class NotFoundError extends EDROSError {
  constructor(message = "Requested resource not found.") {
    super("RESOURCE_NOT_FOUND", message, 404);
  }
}

export class DatabaseError extends EDROSError {
  constructor(message = "Database transaction failed. Constraint violation.", details?: any) {
    super("DATABASE_TRANSACTION_FAILED", message, 500, details);
  }
}

export class SecurityViolationError extends EDROSError {
  constructor(message = "Security boundary violation.") {
    super("SECURITY_VIOLATION", message, 400);
  }
}
