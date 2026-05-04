import { test as base, expect, type Page } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
};

/**
 * Perform the login flow for the Vendor Panel.
 *
 * The login form (vendor-panel/src/app/(auth)/login/page.tsx):
 *   - input[type="email"]     placeholder="vendor@example.com"
 *   - input[type="password"]  placeholder="Enter password"
 *   - button[type="submit"]   text: "Sign In"
 *
 * After login, router.push('/') redirects to the dashboard index.
 */
async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.waitForSelector('form', { state: 'visible', timeout: 15000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // After login, router pushes to '/' — the (dashboard) layout root
  await page.waitForURL('**/', { timeout: 20000 });
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await loginAs(page, 'vendor@crmsoft.in', 'Vendor@123');
    await use(page);
  },
});

export { expect };
