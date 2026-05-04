import { test as base, expect, type Page } from '@playwright/test';

// ── Types ─────────────────────────────────────────────────

type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
};

// ── Helper ────────────────────────────────────────────────

/**
 * Perform the login flow for a given credential pair.
 * The login form uses floating-label inputs — Playwright targets them by
 * placeholder text since the form does NOT use explicit <label for="..."> links.
 *
 * Email field:    placeholder="you@company.com"   type="email"
 * Password field: placeholder="Enter your password" type="password"
 *
 * The submit button is a <button type="submit"> inside the <form>.
 */
async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');

  // Wait for the login form to be fully rendered
  await page.waitForSelector('form', { state: 'visible', timeout: 15000 });

  // Fill email — target by input type to avoid ambiguity with the tenantCode field
  await page.fill('input[type="email"]', email);

  // Fill password
  await page.fill('input[type="password"]', password);

  // Submit
  await page.click('button[type="submit"]');

  // Wait for dashboard redirect — the protected layout mounts after auth
  await page.waitForURL('**/dashboard', { timeout: 20000 });
}

// ── Fixture ───────────────────────────────────────────────

export const test = base.extend<AuthFixtures>({
  /**
   * authenticatedPage — logged-in as a standard CRM user
   * (priya@sharmaenterprises.com / Test@123)
   */
  authenticatedPage: async ({ page }, use) => {
    await loginAs(page, 'priya@sharmaenterprises.com', 'Test@123');
    await use(page);
  },

  /**
   * adminPage — logged-in as the tenant admin / manager role
   * (rajesh@sharmaenterprises.com / Test@123)
   */
  adminPage: async ({ page }, use) => {
    await loginAs(page, 'rajesh@sharmaenterprises.com', 'Test@123');
    await use(page);
  },
});

export { expect };
