import { Page, Locator, expect } from "@playwright/test";

export class AuthPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly authenticateButton: Locator;
  readonly otpInputs: Locator;
  readonly verifyAccessButton: Locator;
  readonly mfaHeader: Locator;
  readonly forgotPasswordLink: Locator;
  readonly restoreLink: Locator;
  readonly dispatchLinkButton: Locator;
  readonly securityAlert: Locator;
  readonly systemLog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.authenticateButton = page.locator('button[type="submit"]');
    this.otpInputs = page.locator('input[maxLength="1"]');
    this.verifyAccessButton = page.locator('button:has-text("VERIFY ACCESS PASS")');
    this.mfaHeader = page.locator('h3:has-text("Enter 6-Digit MFA Token")');
    this.forgotPasswordLink = page.locator('button:has-text("Forgot Credentials?")');
    this.restoreLink = page.locator('button:has-text("Return to authentication page")');
    this.dispatchLinkButton = page.locator('button:has-text("DISPATCH RESTORATION LINK")');
    this.securityAlert = page.locator('div:has-text("SECURITY_ALERT")');
    this.systemLog = page.locator('div:has-text("SYSTEM_LOG")');
  }

  async navigate() {
    await this.page.goto("/");
  }

  async fillEmail(email: string) {
    await expect(this.emailInput).toBeVisible();
    await expect(this.emailInput).toBeEditable();
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await expect(this.passwordInput).toBeVisible();
    await expect(this.passwordInput).toBeEditable();
    await this.passwordInput.fill(password);
  }

  async clickAuthenticate() {
    await expect(this.authenticateButton).toBeVisible();
    await expect(this.authenticateButton).toBeEnabled();
    await this.authenticateButton.click();
  }

  async enterOtp(code: string) {
    await expect(this.otpInputs.first()).toBeVisible();
    for (let i = 0; i < Math.min(code.length, 6); i++) {
      const field = this.otpInputs.nth(i);
      await expect(field).toBeEditable();
      await field.fill(code[i]);
    }
  }

  async clickVerifyAccess() {
    await expect(this.verifyAccessButton).toBeVisible();
    await expect(this.verifyAccessButton).toBeEnabled();
    await this.verifyAccessButton.click();
  }

  async completeLoginFlow(email: string, password: string, otp: string = "123456") {
    await this.navigate();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickAuthenticate();
    await this.enterOtp(otp);
    await this.clickVerifyAccess();
  }
}
