import { Page, Locator, expect } from "@playwright/test";

export class EmployeePage {
  readonly page: Page;

  // Add Operator Section
  readonly addOperatorButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly phoneInput: Locator;
  readonly departmentSelect: Locator;
  readonly jobGradeSelect: Locator;
  readonly baseSalaryInput: Locator;
  readonly saveProfileButton: Locator;
  readonly cancelProfileButton: Locator;

  // Search & Filter
  readonly searchInput: Locator;
  readonly departmentFilter: Locator;

  // Table & Metadata Card
  readonly employeesTable: Locator;
  readonly attendanceClockSelect: Locator;
  readonly punchGeofenceButton: Locator;
  readonly punchSuccessMessage: Locator;
  readonly monthlyPayslipGateButton: Locator;
  readonly monthYearInput: Locator;
  readonly performanceBonusInput: Locator;
  readonly deductionsInput: Locator;
  readonly dispatchBankTransferButton: Locator;
  readonly payslipSuccessMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Add Operator Button & Form
    this.addOperatorButton = page.locator('button:has-text("ADD OPERATOR")');
    this.firstNameInput = page.locator('input[placeholder="e.g. Anand"]');
    this.lastNameInput = page.locator('input[placeholder="e.g. Verma"]');
    this.phoneInput = page.locator('input[placeholder="+91-XXXXX-XXXXX"]');
    this.departmentSelect = page.locator('select').first(); // First select inside form is Department usually, or let's be safer:
    this.jobGradeSelect = page.locator('select').nth(1); // second select
    this.baseSalaryInput = page.locator('input[type="number"]').first();
    this.saveProfileButton = page.locator('button:has-text("SAVE PROFILE & SET PERMISSIONS")');
    this.cancelProfileButton = page.locator('button:has-text("CANCEL")');

    // Search and Filter
    this.searchInput = page.locator('input[placeholder="Search by name, contact phone..."]');
    this.departmentFilter = page.locator('select:has-text("All Departments")');

    // Table & Metadata Card
    this.employeesTable = page.locator('table');
    this.attendanceClockSelect = page.locator('select:has-text("CLOCK-IN")');
    this.punchGeofenceButton = page.locator('button:has-text("PUNCH GPS-GEOFENCE CLOCK")');
    this.punchSuccessMessage = page.locator('div:has-text("PUNCH_SUCCESSFUL")');
    this.monthlyPayslipGateButton = page.locator('button:has-text("MONTHLY PAYSLIP GATE")');
    this.monthYearInput = page.locator('input[placeholder="e.g. 2026-07"]');
    this.performanceBonusInput = page.locator('input[type="number"]').nth(1); // Usually second number input
    this.deductionsInput = page.locator('input[type="number"]').nth(2); // Usually third number input
    this.dispatchBankTransferButton = page.locator('button:has-text("DISPATCH BANK TRANSFER")');
    this.payslipSuccessMessage = page.locator('div:has-text("Payout Document Dispatched")');
  }

  async clickAddOperator() {
    await expect(this.addOperatorButton).toBeVisible();
    await this.addOperatorButton.click();
  }

  async fillOperatorForm(firstName: string, lastName: string, phone: string, dept: string, grade: string, baseSalary: string) {
    await expect(this.firstNameInput).toBeVisible();
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.phoneInput.fill(phone);
    
    // In React forms with tailwind, selectors are best filled using selectOption:
    await this.page.locator('form select').first().selectOption(dept);
    await this.page.locator('form select').nth(1).selectOption(grade);
    await this.page.locator('form input[type="number"]').fill(baseSalary);
  }

  async saveOperator() {
    await expect(this.saveProfileButton).toBeVisible();
    await this.saveProfileButton.click();
  }

  async searchOperator(query: string) {
    await expect(this.searchInput).toBeVisible();
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(300); // Debounce delay
  }

  async selectEmployeeRow(name: string) {
    const row = this.page.locator(`tr:has-text("${name}")`).first();
    await expect(row).toBeVisible();
    await row.click();
  }

  async punchAttendance(action: "CLOCK-IN" | "CLOCK-OUT" | "IN" | "OUT") {
    await expect(this.punchGeofenceButton).toBeVisible();
    // Locate the select dropdown for attendance
    const select = this.page.locator('select').filter({ hasText: /CLOCK-/ });
    if (await select.count() > 0) {
      const opt = action.toUpperCase().includes("IN") ? "IN" : "OUT";
      await select.selectOption(opt);
    }
    await this.punchGeofenceButton.click();
  }

  async openPayslipGate() {
    await expect(this.monthlyPayslipGateButton).toBeVisible();
    await this.monthlyPayslipGateButton.click();
  }

  async dispatchPayslip(monthYear: string, bonus: string, deductions: string) {
    await expect(this.monthYearInput).toBeVisible();
    await this.monthYearInput.fill(monthYear);
    
    // In React forms, we locate the inputs inside the payslip form:
    const bonusInput = this.page.locator('input[type="number"]').filter({ has: this.page.locator('..', { hasText: 'Performance Bonus' }) }).first();
    const dedInput = this.page.locator('input[type="number"]').filter({ has: this.page.locator('..', { hasText: 'Deductions' }) }).first();
    
    if (await bonusInput.count() > 0) {
      await bonusInput.fill(bonus);
    } else {
      await this.page.locator('form input[type="number"]').first().fill(bonus);
    }

    if (await dedInput.count() > 0) {
      await dedInput.fill(deductions);
    } else {
      await this.page.locator('form input[type="number"]').nth(1).fill(deductions);
    }

    await expect(this.dispatchBankTransferButton).toBeVisible();
    await this.dispatchBankTransferButton.click();
  }
}
