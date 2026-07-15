import { Page, Locator, expect } from "@playwright/test";

export class RecoveryPage {
  readonly page: Page;

  // Case List Sidebar
  readonly activeCasesList: Locator;
  readonly firstCaseItem: Locator;

  // Active subtabs
  readonly subtabTelecall: Locator;
  readonly subtabFieldVisit: Locator;
  readonly subtabSettlementProposal: Locator;

  // Log Telecall form
  readonly dispositionSelect: Locator;
  readonly ptpAmountInput: Locator;
  readonly ptpDateInput: Locator;
  readonly callSummaryTextarea: Locator;
  readonly commitCallLogsButton: Locator;

  // Geofenced Visit form
  readonly latitudeInput: Locator;
  readonly longitudeInput: Locator;
  readonly visitStatusSelect: Locator;
  readonly visitSummaryTextarea: Locator;
  readonly commitFieldVisitButton: Locator;

  // Settlement form
  readonly proposedAmountInput: Locator;
  readonly haircutPctText: Locator;
  readonly authorityLevelText: Locator;
  readonly authorizeSettlementButton: Locator;

  // Messages
  readonly successBanner: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Sidebar
    this.activeCasesList = page.locator('h3:has-text("Active Assigned Cases") + div > div');
    this.firstCaseItem = page.locator('h3:has-text("Active Assigned Cases") + div > div').first();

    // Subtabs
    this.subtabTelecall = page.locator('button:has-text("Log Telecall")');
    this.subtabFieldVisit = page.locator('button:has-text("Geofenced Visit")');
    this.subtabSettlementProposal = page.locator('button:has-text("Settlement Proposal")');

    // Telecall form
    this.dispositionSelect = page.locator('select').first(); // Or safer inside active form
    this.ptpAmountInput = page.locator('input[placeholder="e.g. 5000"]');
    this.ptpDateInput = page.locator('input[placeholder="YYYY-MM-DD"]');
    this.callSummaryTextarea = page.locator('textarea[placeholder*="Detail the complete notes"]');
    this.commitCallLogsButton = page.locator('button:has-text("COMMIT CALL RECREATION LOGS")');

    // Field Visit form
    this.latitudeInput = page.locator('input').first(); // Safely locate by parent container or first/second after visit tab click
    this.longitudeInput = page.locator('input').nth(1);
    this.visitStatusSelect = page.locator('select').first();
    this.visitSummaryTextarea = page.locator('textarea[placeholder*="observations, asset tracking"]');
    this.commitFieldVisitButton = page.locator('button:has-text("COMMIT FIELD VERIFICATION REPORT")');

    // Settlement form
    this.proposedAmountInput = page.locator('input[placeholder="e.g. 150000"]');
    this.haircutPctText = page.locator('span:has-text("%")');
    this.authorityLevelText = page.locator('span:has-text("power")');
    this.authorizeSettlementButton = page.locator('button:has-text("AUTHORIZE SECURE SETTLEMENT PAYOFF")');

    // Messages
    this.successBanner = page.locator('div:has-text("ACTION_COMMITTED")');
    this.errorBanner = page.locator('div:has-text("LIMIT_EXCEEDED")');
  }

  async selectCase(name: string) {
    const item = this.page.locator(`div:has-text("${name}")`).first();
    await expect(item).toBeVisible();
    await item.click();
  }

  async selectSubTab(tab: "CALL" | "VISIT" | "SETTLE") {
    let btn: Locator;
    if (tab === "CALL") btn = this.subtabTelecall;
    else if (tab === "VISIT") btn = this.subtabFieldVisit;
    else btn = this.subtabSettlementProposal;

    await expect(btn).toBeVisible();
    await btn.click();
    await this.page.waitForTimeout(100);
  }

  async logTelecall(disposition: string, notes: string, ptpAmt?: string, ptpDate?: string) {
    await this.selectSubTab("CALL");
    // Select disposition option
    await this.page.locator('select').first().selectOption(disposition);
    
    if (disposition === "PROMISE_TO_PAY" && ptpAmt && ptpDate) {
      await expect(this.ptpAmountInput).toBeVisible();
      await this.ptpAmountInput.fill(ptpAmt);
      await this.ptpDateInput.fill(ptpDate);
    }

    await this.callSummaryTextarea.fill(notes);
    await expect(this.commitCallLogsButton).toBeVisible();
    await this.commitCallLogsButton.click();
  }

  async logFieldVisit(lat: string, lng: string, status: string, notes: string) {
    await this.selectSubTab("VISIT");
    // Get inputs in the visit container
    const latIn = this.page.locator('input').first();
    const lngIn = this.page.locator('input').nth(1);
    await latIn.fill(lat);
    await lngIn.fill(lng);

    await this.page.locator('select').first().selectOption(status);
    await this.visitSummaryTextarea.fill(notes);
    await expect(this.commitFieldVisitButton).toBeVisible();
    await this.commitFieldVisitButton.click();
  }

  async proposeSettlement(amount: string) {
    await this.selectSubTab("SETTLE");
    await expect(this.proposedAmountInput).toBeVisible();
    await this.proposedAmountInput.fill(amount);
    await expect(this.authorizeSettlementButton).toBeVisible();
    await this.authorizeSettlementButton.click();
  }
}
