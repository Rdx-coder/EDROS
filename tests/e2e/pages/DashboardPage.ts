import { Page, Locator, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly operationsDeckButton: Locator;
  readonly architectureHubButton: Locator;
  readonly operatorIdentity: Locator;
  readonly signOutButton: Locator;
  readonly apiLiveIndicator: Locator;

  // Tabs locators in Operations Deck
  readonly tabTelemetryDashboard: Locator;
  readonly tabBankOrgSetups: Locator;
  readonly tabStaffRosterPayroll: Locator;
  readonly tabDebtorsRegistries: Locator;
  readonly tabSettlementSandbox: Locator;
  readonly tabCourtNoticesDesk: Locator;
  readonly tabSecureFileVault: Locator;
  readonly tabRbacProfiles: Locator;
  readonly tabWorkflowsEngines: Locator;

  constructor(page: Page) {
    this.page = page;
    this.operationsDeckButton = page.locator('button:has-text("OPERATIONS DECK")');
    this.architectureHubButton = page.locator('button:has-text("ARCHITECTURE HUB")');
    this.operatorIdentity = page.locator('span:has-text("Operator:")');
    this.signOutButton = page.locator('button:has-text("Sign Out Gate")');
    this.apiLiveIndicator = page.locator('span:has-text("API LIVE")');

    // Operations sub tab buttons
    this.tabTelemetryDashboard = page.locator('button:has-text("Telemetry Dashboard")');
    this.tabBankOrgSetups = page.locator('button:has-text("Bank & Org Setups")');
    this.tabStaffRosterPayroll = page.locator('button:has-text("Staff Roster & Payroll")');
    this.tabDebtorsRegistries = page.locator('button:has-text("Debtors Registries")');
    this.tabSettlementSandbox = page.locator('button:has-text("Settlement Sandbox")');
    this.tabCourtNoticesDesk = page.locator('button:has-text("Court & Notices Desk")');
    this.tabSecureFileVault = page.locator('button:has-text("Secure File Vault")');
    this.tabRbacProfiles = page.locator('button:has-text("RBAC & Profiles")');
    this.tabWorkflowsEngines = page.locator('button:has-text("Workflows & Engines")');
  }

  async switchConsoleMode(mode: "OPERATIONS" | "ARCHITECTURE") {
    if (mode === "OPERATIONS") {
      await expect(this.operationsDeckButton).toBeVisible();
      await expect(this.operationsDeckButton).toBeEnabled();
      await this.operationsDeckButton.click();
    } else {
      await expect(this.architectureHubButton).toBeVisible();
      await expect(this.architectureHubButton).toBeEnabled();
      await this.architectureHubButton.click();
    }
  }

  async navigateToTab(tabName: "DASHBOARD" | "ORGANIZATION" | "EMPLOYEES" | "DEBTORS" | "RECOVERY" | "LEGAL" | "DOCUMENTS" | "SETTINGS" | "WORKFLOWS") {
    let tabLocator: Locator;
    switch (tabName) {
      case "DASHBOARD":
        tabLocator = this.tabTelemetryDashboard;
        break;
      case "ORGANIZATION":
        tabLocator = this.tabBankOrgSetups;
        break;
      case "EMPLOYEES":
        tabLocator = this.tabStaffRosterPayroll;
        break;
      case "DEBTORS":
        tabLocator = this.tabDebtorsRegistries;
        break;
      case "RECOVERY":
        tabLocator = this.tabSettlementSandbox;
        break;
      case "LEGAL":
        tabLocator = this.tabCourtNoticesDesk;
        break;
      case "DOCUMENTS":
        tabLocator = this.tabSecureFileVault;
        break;
      case "SETTINGS":
        tabLocator = this.tabRbacProfiles;
        break;
      case "WORKFLOWS":
        tabLocator = this.tabWorkflowsEngines;
        break;
    }
    await expect(tabLocator).toBeVisible();
    await expect(tabLocator).toBeEnabled();
    await tabLocator.click();
    // A brief wait for paint/render lifecycle to settle
    await this.page.waitForTimeout(200);
  }

  async signOut() {
    await expect(this.signOutButton).toBeVisible();
    await expect(this.signOutButton).toBeEnabled();
    await this.signOutButton.click();
  }
}
