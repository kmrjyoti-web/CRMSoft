import { test, expect } from '@playwright/test';
import { CREDENTIALS, URLS, TIMEOUTS } from '../../fixtures/test-data';

// ── Login Flow E2E Tests ───────────────────────────────────────────────────────
//
// The Vendor Panel login page (src/app/(auth)/login/page.tsx):
//   - input[type="email"]      placeholder="vendor@example.com"
//   - input[type="password"]   placeholder="Enter password"
//   - button[type="submit"]    text: "Sign In"
//   - Error div renders when errorMessage state is set (bg-red-50 border)
//
// After successful login: router.push('/') → dashboard index
// Vendor-only portal: CRM admin accounts get a 403 with "vendors only" message
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URLS.login);
    await page.waitForSelector('form', { state: 'visible', timeout: TIMEOUTS.navigation });
  });

  // ── UI rendering ────────────────────────────────────────

  test('should show login form with required fields', async ({ page }) => {
    // Heading: "Vendor Portal"
    await expect(
      page.locator('h1, h2, h3, [class*="title"]', { hasText: /vendor portal/i }).first()
    ).toBeVisible();

    // Email input
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Password input
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Submit button
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText(/sign in/i);
  });

  // ── Register link ────────────────────────────────────────

  test('should show register link for new vendors', async ({ page }) => {
    await expect(page.locator('a[href="/register"]')).toBeVisible();
  });

  // ── Validation: empty submit ─────────────────────────────

  test('should not submit empty form (required HTML validation)', async ({ page }) => {
    // Both inputs have required attribute — browser prevents form submission
    // We verify the inputs remain empty after click attempt
    await page.click('button[type="submit"]');

    // Form should still be visible (not navigated away)
    await expect(page.locator('form')).toBeVisible();
    // URL should still be /login
    expect(page.url()).toContain('/login');
  });

  // ── Invalid credentials ──────────────────────────────────

  test('should show error message for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', CREDENTIALS.invalid.email);
    await page.fill('input[type="password"]', CREDENTIALS.invalid.password);
    await page.click('button[type="submit"]');

    // Error renders as a div with bg-red-50 border-red-200 containing the message
    const errorDiv = page.locator('[class*="bg-red"], [class*="red-50"], [class*="border-red"]').first();
    await expect(errorDiv).toBeVisible({ timeout: TIMEOUTS.dataLoad });
  });

  // ── Page structure: mobile friendly ─────────────────────

  test('should render without horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(URLS.login);
    await page.waitForSelector('form', { state: 'visible' });

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });
});
