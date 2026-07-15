/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { EnterpriseAuthService } from "../../src/application/authService";
import { UserRole, Permission } from "../../src/types";

describe("EnterpriseAuthService Unit Tests", () => {
  beforeEach(() => {
    // Session states are static maps inside EnterpriseAuthService, let's clear them implicitly via user sessions
    EnterpriseAuthService.revokeAllUserSessions("user-test-id");
  });

  describe("Password Hashing & Verification", () => {
    it("should hash a password and verify it correctly", async () => {
      const plaintext = "P@ssw0rd1234!!";
      const hash = await EnterpriseAuthService.hashPassword(plaintext);

      expect(hash).toContain("pbkdf2$50000$");
      
      const isMatched = await EnterpriseAuthService.verifyPassword(plaintext, hash);
      expect(isMatched).toBe(true);

      const isNotMatched = await EnterpriseAuthService.verifyPassword("wrong_password", hash);
      expect(isNotMatched).toBe(false);
    });

    it("should track password changes and prevent reusing password from history", async () => {
      const userId = "user-test-id";
      const p1 = "firstpass123";
      const p2 = "secondpass123";

      const h1 = await EnterpriseAuthService.hashPassword(p1);
      const h2 = await EnterpriseAuthService.hashPassword(p2);

      await EnterpriseAuthService.trackPasswordChange(userId, h1);
      expect(await EnterpriseAuthService.isPasswordInHistory(userId, p1)).toBe(true);
      expect(await EnterpriseAuthService.isPasswordInHistory(userId, p2)).toBe(false);

      await EnterpriseAuthService.trackPasswordChange(userId, h2);
      expect(await EnterpriseAuthService.isPasswordInHistory(userId, p1)).toBe(true);
      expect(await EnterpriseAuthService.isPasswordInHistory(userId, p2)).toBe(true);
    });

    it("should verify password expiration", async () => {
      const userId = "user-test-id";
      const hash = await EnterpriseAuthService.hashPassword("testpass");
      await EnterpriseAuthService.trackPasswordChange(userId, hash);

      // Default 90 days. Since we just changed it, it shouldn't be expired.
      const isExpired = await EnterpriseAuthService.isPasswordExpired(userId, 90);
      expect(isExpired).toBe(false);
    });
  });

  describe("Custom JWT Processing", () => {
    it("should sign and verify valid JWT tokens", () => {
      const payload = { userId: "user-123", email: "test@edros.net", role: UserRole.RECOVERY_EXECUTIVE };
      const token = EnterpriseAuthService.signToken(payload, 30); // 30 sec expiration

      expect(token.split(".").length).toBe(3);

      const decoded = EnterpriseAuthService.verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe("user-123");
      expect(decoded?.email).toBe("test@edros.net");
    });

    it("should reject expired or tampered tokens", () => {
      const payload = { userId: "user-123" };
      const token = EnterpriseAuthService.signToken(payload, -5); // Expired 5 seconds ago

      const decoded = EnterpriseAuthService.verifyToken(token);
      expect(decoded).toBeNull();

      // Tampering verification
      const validToken = EnterpriseAuthService.signToken(payload, 60);
      const parts = validToken.split(".");
      // Modify body content slightly
      const tamperedBody = Buffer.from(JSON.stringify({ userId: "user-tampered", exp: Date.now() + 60000 })).toString("base64url");
      const tamperedToken = `${parts[0]}.${tamperedBody}.${parts[2]}`;

      const verifiedTampered = EnterpriseAuthService.verifyToken(tamperedToken);
      expect(verifiedTampered).toBeNull();
    });
  });

  describe("Session Management & Refresh Token Rotation", () => {
    it("should create active sessions and support rotation", () => {
      const dateSpy = vi.spyOn(Date, "now");
      dateSpy.mockReturnValue(1784098045000); // T = 0s

      const session = EnterpriseAuthService.createSession(
        "user-test-id",
        "executive@edros.net",
        UserRole.RECOVERY_EXECUTIVE,
        "127.0.0.1",
        "Vitest-Agent"
      );

      expect(session).not.toBeNull();
      expect(session.sessionId).toBeDefined();

      const fetchedSession = EnterpriseAuthService.getSession(session.sessionId);
      expect(fetchedSession).not.toBeNull();
      expect(fetchedSession?.isRevoked).toBe(false);

      // Advance by 10 seconds for different iat
      dateSpy.mockReturnValue(1784098055000); // T = 10s

      const originalAccessToken = session.accessToken;
      const originalRefreshToken = session.refreshToken;

      // Rotate Refresh Token
      const rotated = EnterpriseAuthService.rotateRefreshToken(session.refreshToken, "127.0.0.1", "Vitest-Agent-Rotated");
      expect(rotated).not.toBeNull();
      expect(rotated?.accessToken).not.toBe(originalAccessToken);
      expect(rotated?.refreshToken).not.toBe(originalRefreshToken);

      // Revoke Session
      EnterpriseAuthService.revokeSession(session.sessionId);
      expect(EnterpriseAuthService.getSession(session.sessionId)).toBeNull();

      dateSpy.mockRestore();
    });

    it("should detect reuse of a refresh token and revoke the entire session immediately", () => {
      const dateSpy = vi.spyOn(Date, "now");
      dateSpy.mockReturnValue(1784098045000); // T = 0s

      const session = EnterpriseAuthService.createSession(
        "user-test-id",
        "executive@edros.net",
        UserRole.RECOVERY_EXECUTIVE,
        "127.0.0.1",
        "Vitest-Agent"
      );

      const originalRefresh = session.refreshToken;

      // Advance by 10s
      dateSpy.mockReturnValue(1784098055000); // T = 10s

      // First rotation works
      const rotated = EnterpriseAuthService.rotateRefreshToken(originalRefresh, "127.0.0.1", "Vitest-Agent");
      expect(rotated).not.toBeNull();

      // Advance by 10s
      dateSpy.mockReturnValue(1784098065000); // T = 20s

      // Second rotation with the OLD refresh token triggers a reuse attack alarm!
      const stolenAttempt = EnterpriseAuthService.rotateRefreshToken(originalRefresh, "127.0.0.1", "Vitest-Agent");
      expect(stolenAttempt).toBeNull();

      // Verify the session has been automatically revoked to protect the user
      const currentSession = EnterpriseAuthService.getSession(session.sessionId);
      expect(currentSession).toBeNull(); // Revoked!

      dateSpy.mockRestore();
    });
  });

  describe("Multi-Factor OTP Dual Channel Flow", () => {
    it("should generate, verify, and limit OTP attempts", () => {
      const email = "recovery@bank.com";
      const code = EnterpriseAuthService.generateOTP(email, "EMAIL");

      expect(code.length).toBe(6);

      // Verify wrong code increments retry counter
      const firstCheck = EnterpriseAuthService.verifyOTP(email, "000000");
      expect(firstCheck.success).toBe(false);
      expect(firstCheck.error).toContain("2 attempts remaining");

      const secondCheck = EnterpriseAuthService.verifyOTP(email, "111111");
      expect(secondCheck.success).toBe(false);
      expect(secondCheck.error).toContain("1 attempts remaining");

      // Verify correct code passes and purges OTP to prevent replay
      const thirdCheck = EnterpriseAuthService.verifyOTP(email, code);
      expect(thirdCheck.success).toBe(true);

      // Replay attack verification
      const replayCheck = EnterpriseAuthService.verifyOTP(email, code);
      expect(replayCheck.success).toBe(false);
      expect(replayCheck.error).toContain("not been dispatched");
    });

    it("should lock out users on exceeding 3 OTP failures", () => {
      const email = "lockout@bank.com";
      EnterpriseAuthService.generateOTP(email, "EMAIL");

      EnterpriseAuthService.verifyOTP(email, "123456"); // fail 1, retries = 1
      EnterpriseAuthService.verifyOTP(email, "123456"); // fail 2, retries = 2
      EnterpriseAuthService.verifyOTP(email, "123456"); // fail 3, retries = 3
      const lockoutCheck = EnterpriseAuthService.verifyOTP(email, "123456"); // fail 4 -> lock out!

      expect(lockoutCheck.success).toBe(false);
      expect(lockoutCheck.error).toContain("Brute force protection triggered");

      // Check that record is cleared
      const checkDeleted = EnterpriseAuthService.verifyOTP(email, "123456");
      expect(checkDeleted.error).toContain("not been dispatched");
    });
  });

  describe("RBAC Permissions", () => {
    it("should evaluate permissions correctly based on roles", () => {
      expect(EnterpriseAuthService.hasPermission(UserRole.SUPER_ADMIN, Permission.MANAGE_TENANTS)).toBe(true);
      expect(EnterpriseAuthService.hasPermission(UserRole.TENANT_ADMIN, Permission.MANAGE_TENANTS)).toBe(false);
      expect(EnterpriseAuthService.hasPermission(UserRole.TENANT_ADMIN, Permission.MANAGE_USERS)).toBe(true);
      expect(EnterpriseAuthService.hasPermission(UserRole.RECOVERY_EXECUTIVE, Permission.VIEW_DEBT_SENSITIVE)).toBe(true);
      expect(EnterpriseAuthService.hasPermission(UserRole.RECOVERY_EXECUTIVE, Permission.ALLOCATE_DEBT_CASES)).toBe(false);
    });
  });
});
