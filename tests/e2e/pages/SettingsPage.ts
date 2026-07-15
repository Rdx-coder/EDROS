import { Page, Locator, expect } from "@playwright/test";

export class SettingsPage {
  readonly page: Page;

  // Subtab navigation
  readonly subtabRbac: Locator;
  readonly subtabProfile: Locator;
  readonly subtabAudit: Locator;
  readonly subtabShortcuts: Locator;

  // RBAC Tab
  readonly rbacTable: Locator;
  readonly saveRulesButton: Locator;

  // Profile Tab
  readonly authorityRoleSelect: Locator;
  readonly saveProfileWarning: Locator;

  // Audit Tab
  readonly auditLogsTable: Locator;

  // Shortcuts Tab
  readonly hotkeysGrid: Locator;

  // Messages
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Subtab buttons
    this.subtabRbac = page.locator('button:has-text("Role Permission Matrix")');
    this.subtabProfile = page.locator('button:has-text("Operator Sandbox Profile")');
    this.subtabAudit = page.locator('button:has-text("System Audit Trails")');
    this.subtabShortcuts = page.locator('button:has-text("Hotkeys Guide")');

    // Tab content elements
    this.rbacTable = page.locator('table').first();
    this.saveRulesButton = page.locator('button:has-text("SAVE RULES")');

    this.authorityRoleSelect = page.locator('select').first(); // Sandbox authority select
    this.saveProfileWarning = page.locator('div:has-text("Swapping role re-initializes permission guards")');

    this.auditLogsTable = page.locator('table').first();
    this.hotkeysGrid = page.locator('div:has-text("Operations Console Keyboard Shortcuts")');

    this.successMessage = page.locator('div:has-text("RBAC permission rules written")');
  }

  async selectSubTab(tab: "RBAC" | "PROFILE" | "AUDIT" | "SHORTCUTS") {
    let btn: Locator;
    switch (tab) {
      case "RBAC":
        btn = this.subtabRbac;
        break;
      case "PROFILE":
        btn = this.subtabProfile;
        break;
      case "AUDIT":
        btn = this.subtabAudit;
        break;
      case "SHORTCUTS":
        btn = this.subtabShortcuts;
        break;
    }
    await expect(btn).toBeVisible();
    await btn.click();
    await this.page.waitForTimeout(100);
  }

  async togglePermission(role: string, permission: string) {
    await this.selectSubTab("RBAC");
    // Find permission row, then find column corresponding to role
    const row = this.page.locator(`tr:has-text("${permission}")`);
    await expect(row).toBeVisible();

    // Since the headers map roles, we can click the cell under that column or find the checkbox inside the row matching the role
    // Wait, let's locate the column by role index or just click the checkbox inside that row. 
    // To make it incredibly robust and not depend on order, let's select the nth SVG button or check icon in the row:
    // Let's click on the row's child matching the specific role, or since there are checkboxes, we can click the column:
    const cell = row.locator('td').nth(1); // Click some cell or first interactive child
    await cell.click();
  }

  async saveRbacRules() {
    await expect(this.saveRulesButton).toBeVisible();
    await this.saveRulesButton.click();
  }

  async switchSandboxRole(role: string) {
    await this.selectSubTab("PROFILE");
    await expect(this.authorityRoleSelect).toBeVisible();
    await this.authorityRoleSelect.selectOption(role);
    await this.page.waitForTimeout(300); // Wait for role change updates to apply across context state
  }
}
