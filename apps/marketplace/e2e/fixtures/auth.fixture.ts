import { test as base, expect, type Page } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
};

/**
 * Perform the login flow for the Marketplace.
 *
 * The login form (marketplace/src/app/(auth)/login/page.tsx):
 *   - input[type="email"]     placeholder="Email address"
 *   - input[type="password"]  placeholder="Password"
 *   - button[type="submit"]   text: "Sign In"
 *
 * After login, router.replace('/feed') redirects to the feed.
 * Note: marketplace uses basePath '/marketplace', so '/feed' → '/marketplace/feed'
 */
async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.waitForSelector('form', { state: 'visible', timeout: 15000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // After login, router.replace('/feed')
  await page.waitForURL('**/feed**', { timeout: 20000 });
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await loginAs(page, 'buyer@testmarket.com', 'Market@123');
    await use(page);
  },
});

export { expect };
