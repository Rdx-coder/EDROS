import { test as baseTest } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { DashboardPage } from "../pages/DashboardPage";
import { EmployeePage } from "../pages/EmployeePage";
import { RecoveryPage } from "../pages/RecoveryPage";
import { LegalPage } from "../pages/LegalPage";
import { DocumentsPage } from "../pages/DocumentsPage";
import { SettingsPage } from "../pages/SettingsPage";

// Declare our custom page object fixtures
interface PageObjects {
  authPage: AuthPage;
  dashboardPage: DashboardPage;
  employeePage: EmployeePage;
  recoveryPage: RecoveryPage;
  legalPage: LegalPage;
  documentsPage: DocumentsPage;
  settingsPage: SettingsPage;
  authenticatedPage: {
    authPage: AuthPage;
    dashboardPage: DashboardPage;
  };
}

// Extend base test with our custom fixtures
export const test = baseTest.extend<PageObjects>({
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  employeePage: async ({ page }, use) => {
    const employeePage = new EmployeePage(page);
    await use(employeePage);
  },

  recoveryPage: async ({ page }, use) => {
    const recoveryPage = new RecoveryPage(page);
    await use(recoveryPage);
  },

  legalPage: async ({ page }, use) => {
    const legalPage = new LegalPage(page);
    await use(legalPage);
  },

  documentsPage: async ({ page }, use) => {
    const documentsPage = new DocumentsPage(page);
    await use(documentsPage);
  },

  settingsPage: async ({ page }, use) => {
    const settingsPage = new SettingsPage(page);
    await use(settingsPage);
  },

  // A convenient auto-authenticated session fixture for fast setup
  authenticatedPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // Perform standard login
    await authPage.completeLoginFlow("rahul.dangi.sait@gmail.com", "edros-secure-2026", "123456");
    
    await use({ authPage, dashboardPage });
  },
});

export { expect } from "@playwright/test";
export type { PageObjects };
