import { Page, Locator, expect } from "@playwright/test";

export class LegalPage {
  readonly page: Page;

  // Subtabs
  readonly subtabCases: Locator;
  readonly subtabNotices: Locator;

  // Cases Subtab Elements
  readonly registerSuitButton: Locator;
  readonly suitNoInput: Locator;
  readonly courtNameSelect: Locator;
  readonly hearingDateInput: Locator;
  readonly suitNatureSelect: Locator;
  readonly saveSuitButton: Locator;

  readonly docketsTable: Locator;
  readonly hearingCalendarSelect: Locator;
  readonly recordHearingButton: Locator;
  readonly recordHearingSuccessMessage: Locator;

  // Adjournment form
  readonly adjournButton: Locator;
  readonly adjournmentReasonSelect: Locator;
  readonly nextHearingDateInput: Locator;
  readonly adjournmentNotesTextarea: Locator;
  readonly commitAdjournmentButton: Locator;

  // Notices Subtab Elements
  readonly draftNoticeButton: Locator;
  readonly noticeTemplateSelect: Locator;
  readonly dispatchRefNoInput: Locator;
  readonly relatedCaseIdSelect: Locator;
  readonly courierTrackingNoInput: Locator;
  readonly generateNoticeButton: Locator;
  readonly noticesLedgerTable: Locator;

  constructor(page: Page) {
    this.page = page;

    // Subtabs
    this.subtabCases = page.locator('button:has-text("Court Litigation Suits")');
    this.subtabNotices = page.locator('button:has-text("Legal notices Dispatch")');

    // Cases form
    this.registerSuitButton = page.locator('button:has-text("REGISTER NEW COURT SUIT")');
    this.suitNoInput = page.locator('input[placeholder="e.g. OS/5042/2026"]');
    this.courtNameSelect = page.locator('select').first();
    this.hearingDateInput = page.locator('input[placeholder="YYYY-MM-DD"]').first();
    this.suitNatureSelect = page.locator('select').nth(1);
    this.saveSuitButton = page.locator('button:has-text("SAVE LITIGATION CASE & OPEN DOCKET")');

    // Table & Details
    this.docketsTable = page.locator('table');
    this.hearingCalendarSelect = page.locator('select').first();
    this.recordHearingButton = page.locator('button:has-text("RECORD HEARING VERDICT")');

    // Adjournment
    this.adjournButton = page.locator('button:has-text("ADJOURN HEARING")');
    this.adjournmentReasonSelect = page.locator('select').first();
    this.nextHearingDateInput = page.locator('input[type="date"]');
    this.adjournmentNotesTextarea = page.locator('textarea[placeholder*="Detail specific court orders"]');
    this.commitAdjournmentButton = page.locator('button:has-text("COMMIT ADJOURNMENT")');

    // Notices Form
    this.draftNoticeButton = page.locator('button:has-text("DRAFT NEW LEGAL NOTICE")');
    this.noticeTemplateSelect = page.locator('select').first();
    this.dispatchRefNoInput = page.locator('input[placeholder="e.g. EDROS-LN-2026-9081"]');
    this.relatedCaseIdSelect = page.locator('select').nth(1);
    this.courierTrackingNoInput = page.locator('input[placeholder="e.g. SpeedPost SP-88127"]');
    this.generateNoticeButton = page.locator('button:has-text("GENERATE LEGAL NOTICE & WATERMARK PDF")');
    this.noticesLedgerTable = page.locator('table');
  }

  async selectSubTab(tab: "CASES" | "NOTICES") {
    const btn = tab === "CASES" ? this.subtabCases : this.subtabNotices;
    await expect(btn).toBeVisible();
    await btn.click();
    await this.page.waitForTimeout(100);
  }

  async registerCourtSuit(suitNo: string, courtName: string, date: string, nature: string) {
    await this.selectSubTab("CASES");
    await expect(this.registerSuitButton).toBeVisible();
    await this.registerSuitButton.click();

    await this.suitNoInput.fill(suitNo);
    await this.page.locator('form select').first().selectOption(courtName);
    await this.page.locator('form input[placeholder="YYYY-MM-DD"]').fill(date);
    await this.page.locator('form select').nth(1).selectOption(nature);

    await expect(this.saveSuitButton).toBeVisible();
    await this.saveSuitButton.click();
  }

  async selectCaseRow(suitNo: string) {
    const row = this.page.locator(`tr:has-text("${suitNo}")`).first();
    await expect(row).toBeVisible();
    await row.click();
  }

  async adjounHearing(reason: string, date: string, notes: string) {
    await expect(this.adjournButton).toBeVisible();
    await this.adjournButton.click();

    await this.page.locator('form select').first().selectOption(reason);
    await this.page.locator('form input[type="date"]').fill(date);
    await this.page.locator('form textarea').fill(notes);

    await expect(this.commitAdjournmentButton).toBeVisible();
    await this.commitAdjournmentButton.click();
  }

  async draftLegalNotice(template: string, refNo: string, relatedCase: string, trackingNo: string) {
    await this.selectSubTab("NOTICES");
    await expect(this.draftNoticeButton).toBeVisible();
    await this.draftNoticeButton.click();

    await this.page.locator('form select').first().selectOption(template);
    await this.dispatchRefNoInput.fill(refNo);
    await this.page.locator('form select').nth(1).selectOption({ label: relatedCase });
    await this.courierTrackingNoInput.fill(trackingNo);

    await expect(this.generateNoticeButton).toBeVisible();
    await this.generateNoticeButton.click();
  }
}
