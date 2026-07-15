# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workflow.spec.ts >> EDROS Banking & Debt Recovery Operating System E2E & Accessibility Tests >> 1. Multi-factor Authentication Flow and Session Storage verification
- Location: tests/e2e/workflow.spec.ts:10:3

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /EDROS/i
Received string:  "My Google AI Studio App"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    14 × unexpected value "My Google AI Studio App"

```

```yaml
- banner:
  - text: System Design Authority
  - heading "EDROS / Enterprise Debt Recovery OS" [level=1]
  - button "OPERATIONS DECK"
  - button "ARCHITECTURE HUB"
  - text: API LIVE
- text: E
- heading "EDROS Platform Gate" [level=2]
- paragraph: MFA Security Layer v2.4.1
- text: Corporate Email
- textbox "name@edros-nbfc.net": rahul.dangi.sait@gmail.com
- text: Secure Password
- button "Forgot Credentials?"
- textbox "••••••••••••••": edros-secure-2026
- button
- button "AUTHENTICATE OPERATOR"
- text: "Local Seeder Auth:"
- paragraph: Standard profile auto-filled. Password bypass is active. Click Authenticate to continue.
- contentinfo: "Ingress Gateway Listening: http://0.0.0.0:3000 Multi-Tenant Secure Isolation SOLID compliant"
```

# Test source

```ts
  1  | /**
  2  |  * @license
  3  |  * SPDX-License-Identifier: Apache-2.0
  4  |  */
  5  | 
  6  | import { test, expect } from "@playwright/test";
  7  | 
  8  | test.describe("EDROS Banking & Debt Recovery Operating System E2E & Accessibility Tests", () => {
  9  | 
  10 |   test("1. Multi-factor Authentication Flow and Session Storage verification", async ({ page }) => {
  11 |     // 1. Visit App Root
  12 |     await page.goto("/");
> 13 |     await expect(page).toHaveTitle(/EDROS/i);
     |                        ^ Error: expect(page).toHaveTitle(expected) failed
  14 | 
  15 |     // 2. Auth Page is displayed. Find email input, verify default and fill credentials
  16 |     const emailInput = page.locator('input[type="email"]');
  17 |     await expect(emailInput).toBeVisible();
  18 |     await emailInput.fill("rahul.dangi.sait@gmail.com");
  19 | 
  20 |     const passwordInput = page.locator('input[type="password"]');
  21 |     await passwordInput.fill("edros-secure-2026");
  22 | 
  23 |     // Click AUTHENTICATE OPERATOR
  24 |     const loginButton = page.locator('button[type="submit"]');
  25 |     await expect(loginButton).toContainText("AUTHENTICATE OPERATOR");
  26 |     await loginButton.click();
  27 | 
  28 |     // 3. MFA Screen: Wait for OTP input digits to be visible
  29 |     const otpFields = page.locator('input[maxLength="1"]');
  30 |     await expect(otpFields.first()).toBeVisible();
  31 | 
  32 |     // Type complete OTP code: '123456'
  33 |     for (let i = 0; i < 6; i++) {
  34 |       await otpFields.nth(i).fill(String(i + 1));
  35 |     }
  36 | 
  37 |     // Submit OTP Passcode
  38 |     const verifyButton = page.locator('button:has-text("VERIFY ACCESS PASS")');
  39 |     await verifyButton.click();
  40 | 
  41 |     // 4. Session Successful: Validate login identity and operations dashboard entry
  42 |     const operatorIdentity = page.locator('span:has-text("Operator: rahul.dangi.sait@gmail.com")');
  43 |     await expect(operatorIdentity).toBeVisible();
  44 |   });
  45 | 
  46 |   test("2. Operations tab navigation & View switching sanity checks", async ({ page }) => {
  47 |     // Perform auto-bypass log in
  48 |     await page.goto("/");
  49 |     await page.locator('button[type="submit"]').click();
  50 |     await page.waitForTimeout(1500); // Wait for transition
  51 |     await page.locator('button:has-text("VERIFY ACCESS PASS")').click();
  52 | 
  53 |     // Confirm landing on the main Operations dashboard view
  54 |     await expect(page.locator('span:has-text("Operator:")')).toBeVisible();
  55 | 
  56 |     // Click through standard enterprise tabs to verify frontend view lifecycle
  57 |     const tabs = ["DASHBOARD", "EMPLOYEES", "DEBTORS", "RECOVERY", "LEGAL", "DOCUMENTS", "SETTINGS", "WORKFLOWS"];
  58 | 
  59 |     for (const tab of tabs) {
  60 |       const tabBtn = page.locator(`button:has-text("${tab}")`);
  61 |       if (await tabBtn.count() > 0) {
  62 |         await tabBtn.first().click();
  63 |         await page.waitForTimeout(100); // Give React brief paint interval
  64 |       }
  65 |     }
  66 |   });
  67 | 
  68 |   test("3. Visual Responsiveness & Device Adapter checks", async ({ page }) => {
  69 |     // 1. Mobile Viewport (iPhone 11 Pro size)
  70 |     await page.setViewportSize({ width: 375, height: 812 });
  71 |     await page.goto("/");
  72 |     
  73 |     // Check main workspace container and title are correctly adapter styled
  74 |     const title = page.locator("h1");
  75 |     await expect(title).toBeVisible();
  76 | 
  77 |     // 2. Desktop Viewport (Full High-Def)
  78 |     await page.setViewportSize({ width: 1920, height: 1080 });
  79 |     await page.goto("/");
  80 |     await expect(title).toBeVisible();
  81 |   });
  82 | 
  83 |   test("4. Accessibility (Aria Roles, Contrast & Inputs)", async ({ page }) => {
  84 |     await page.goto("/");
  85 | 
  86 |     // Verify critical authentication elements are visible, high-contrast, and keyboard navigable
  87 |     const emailInput = page.locator('input[type="email"]');
  88 |     await expect(emailInput).toBeFocused(); // AuthScreen auto-focuses first element or is tab-reachable
  89 |     
  90 |     // Inputs must have readable placeholder text and form labels matching ARIA safety standards
  91 |     await expect(page.locator('label:has-text("Corporate Email")')).toBeVisible();
  92 |     await expect(page.locator('label:has-text("Secure Password")')).toBeVisible();
  93 |   });
  94 | });
  95 | 
```