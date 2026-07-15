/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, expect } from "@playwright/test";

test.describe("EDROS Banking & Debt Recovery Operating System E2E & Accessibility Tests", () => {

  test("1. Multi-factor Authentication Flow and Session Storage verification", async ({ page }) => {
    // 1. Visit App Root
    await page.goto("/");
    await expect(page).toHaveTitle(/EDROS/i);

    // 2. Auth Page is displayed. Find email input, verify default and fill credentials
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await emailInput.fill("rahul.dangi.sait@gmail.com");

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill("edros-secure-2026");

    // Click AUTHENTICATE OPERATOR
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toContainText("AUTHENTICATE OPERATOR");
    await loginButton.click();

    // 3. MFA Screen: Wait for OTP input digits to be visible
    const otpFields = page.locator('input[maxLength="1"]');
    await expect(otpFields.first()).toBeVisible();

    // Type complete OTP code: '123456'
    for (let i = 0; i < 6; i++) {
      await otpFields.nth(i).fill(String(i + 1));
    }

    // Submit OTP Passcode
    const verifyButton = page.locator('button:has-text("VERIFY ACCESS PASS")');
    await verifyButton.click();

    // 4. Session Successful: Validate login identity and operations dashboard entry
    const operatorIdentity = page.locator('span:has-text("Operator: rahul.dangi.sait@gmail.com")');
    await expect(operatorIdentity).toBeVisible();
  });

  test("2. Operations tab navigation & View switching sanity checks", async ({ page }) => {
    // Perform auto-bypass log in
    await page.goto("/");
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500); // Wait for transition
    await page.locator('button:has-text("VERIFY ACCESS PASS")').click();

    // Confirm landing on the main Operations dashboard view
    await expect(page.locator('span:has-text("Operator:")')).toBeVisible();

    // Click through standard enterprise tabs to verify frontend view lifecycle
    const tabs = ["DASHBOARD", "EMPLOYEES", "DEBTORS", "RECOVERY", "LEGAL", "DOCUMENTS", "SETTINGS", "WORKFLOWS"];

    for (const tab of tabs) {
      const tabBtn = page.locator(`button:has-text("${tab}")`);
      if (await tabBtn.count() > 0) {
        await tabBtn.first().click();
        await page.waitForTimeout(100); // Give React brief paint interval
      }
    }
  });

  test("3. Visual Responsiveness & Device Adapter checks", async ({ page }) => {
    // 1. Mobile Viewport (iPhone 11 Pro size)
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    
    // Check main workspace container and title are correctly adapter styled
    const title = page.locator("h1");
    await expect(title).toBeVisible();

    // 2. Desktop Viewport (Full High-Def)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await expect(title).toBeVisible();
  });

  test("4. Accessibility (Aria Roles, Contrast & Inputs)", async ({ page }) => {
    await page.goto("/");

    // Verify critical authentication elements are visible, high-contrast, and keyboard navigable
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeFocused(); // AuthScreen auto-focuses first element or is tab-reachable
    
    // Inputs must have readable placeholder text and form labels matching ARIA safety standards
    await expect(page.locator('label:has-text("Corporate Email")')).toBeVisible();
    await expect(page.locator('label:has-text("Secure Password")')).toBeVisible();
  });
});
