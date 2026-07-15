import { Page, Locator, expect } from "@playwright/test";

export class DocumentsPage {
  readonly page: Page;

  // File Uploader / Dropzone
  readonly dropzone: Locator;
  readonly fileInput: Locator;

  // List search & filters
  readonly searchInput: Locator;
  readonly tagFilterSelect: Locator;
  readonly statusFilterSelect: Locator;
  readonly reloadButton: Locator;

  // Documents ledger table & selections
  readonly documentRows: Locator;
  readonly pdfMergerToolbar: Locator;
  readonly mergeNameInput: Locator;
  readonly mergePdfButton: Locator;

  // RC4 lock modal
  readonly encryptModal: Locator;
  readonly encryptPasswordInput: Locator;
  readonly sealEncryptButton: Locator;

  // Success messages
  readonly alertBanner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Dropzone
    this.dropzone = page.locator('div:has-text("Secure Object Vault Dropper")').first();
    this.fileInput = page.locator('input[type="file"]');

    // Filters
    this.searchInput = page.locator('input[placeholder="Search secure documents by filename or unique tag..."]');
    this.tagFilterSelect = page.locator('select').first();
    this.statusFilterSelect = page.locator('select').nth(1);
    this.reloadButton = page.locator('button[title="Reload database registries"]');

    // Selections
    this.documentRows = page.locator('table tbody tr');
    this.pdfMergerToolbar = page.locator('div:has-text("PDF Stitcher Queue")');
    this.mergeNameInput = page.locator('input[placeholder="Output name (e.g. bundle.pdf)"]');
    this.mergePdfButton = page.locator('button:has-text("Merge PDFs")');

    // Cryptographic lock modal
    this.encryptModal = page.locator('div:has-text("128-bit RC4 Stream Seal")');
    this.encryptPasswordInput = page.locator('input[type="password"]');
    this.sealEncryptButton = page.locator('button:has-text("Seal & Encrypt")');

    // Alerts
    this.alertBanner = page.locator('div:has-text("Security Core Exception"), div:has-text("Secure Log Entry Event")');
  }

  async uploadFile(filename: string, content: string = "dummy content") {
    // Inject a dummy file upload using Playwright API
    await expect(this.fileInput).toBeAttached();
    await this.fileInput.setInputFiles({
      name: filename,
      mimeType: "application/pdf",
      buffer: Buffer.from(content)
    });
    await this.page.waitForTimeout(1000); // Allow ingestion to execute
  }

  async searchAndFilter(query: string, tag?: string, status?: string) {
    await this.searchInput.fill(query);
    if (tag) {
      await this.tagFilterSelect.selectOption(tag);
    }
    if (status) {
      await this.statusFilterSelect.selectOption(status);
    }
    await this.reloadButton.click();
    await this.page.waitForTimeout(300);
  }

  async selectRowForMerge(filename: string) {
    const row = this.page.locator(`tr:has-text("${filename}")`);
    await expect(row).toBeVisible();
    const checkbox = row.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible();
    await checkbox.check();
  }

  async triggerMerge(outputName: string) {
    await expect(this.pdfMergerToolbar).toBeVisible();
    await this.mergeNameInput.fill(outputName);
    await expect(this.mergePdfButton).toBeVisible();
    await this.mergePdfButton.click();
  }

  async approveDocument(filename: string) {
    const row = this.page.locator(`tr:has-text("${filename}")`);
    await expect(row).toBeVisible();
    const approveBtn = row.locator('button[title="Authorize & Approve Document"]');
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();
  }

  async rejectDocument(filename: string) {
    const row = this.page.locator(`tr:has-text("${filename}")`);
    await expect(row).toBeVisible();
    const rejectBtn = row.locator('button[title="Flag / Reject Document"]');
    await expect(rejectBtn).toBeVisible();
    await rejectBtn.click();
  }

  async encryptDocument(filename: string, password: string) {
    const row = this.page.locator(`tr:has-text("${filename}")`);
    await expect(row).toBeVisible();
    const lockBtn = row.locator('button[title="RC4 Cryptographic Password Seal"]');
    await expect(lockBtn).toBeVisible();
    await lockBtn.click();

    // Fill Modal
    await expect(this.encryptModal).toBeVisible();
    await this.encryptPasswordInput.fill(password);
    await expect(this.sealEncryptButton).toBeVisible();
    await this.sealEncryptButton.click();
  }
}
