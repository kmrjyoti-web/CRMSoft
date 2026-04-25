import { test, expect } from '@playwright/test';
import { CREDENTIALS, URLS, TIMEOUTS } from '../../fixtures/test-data';

// ── Login Flow E2E Tests ───────────────────────────────────────────────────────
//
// The login page is at /login (Next.js route group: (auth)).
// The LoginForm component renders:
//   - input[type="email"]         — email field
//   - input[type="password"]      — password field
//   - input[type="text"]          — optional tenantCode field
//   - button[type="submit"]       — "Sign in" button
//   - div[role="alert"]           — server error banner
//
// After a successful login the router pushes to /dashboard.
// Logout is triggered by the "Log Out" button inside the profile popover
// in the CRMHeader component (.travelos-btn--logout).
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URLS.login);
    // Wait for the form to be visible before each test
    await page.waitForSelector('form', { state: 'visible', timeout: TIMEOUTS.navigation });
  });

  // ── UI rendering ────────────────────────────────────────

  test('should show login form with required fields', async ({ page }) => {
    // Heading
    await expect(page.locator('h1, h2, h3').filter({ hasText: /sign in/i }).first()).toBeVisible();

    // Email input
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Password input
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Submit button
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText(/sign in/i);

    // Forgot password link
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible();
  });

  // ── Validation: empty submit ─────────────────────────────

  test('should show validation errors when submitting empty form', async ({ page }) => {
    await page.click('button[type="submit"]');

    // react-hook-form + zod validation messages appear inline
    // "Email is required" or "Password must be at least 6 characters"
    const errorMessages = page.locator('[class*="error"], [class*="invalid"], .text-red');
    // At least one validation message should appear
    await expect(errorMessages.first()).toBeVisible({ timeout: TIMEOUTS.interaction });
  });

  // ── Invalid credentials ──────────────────────────────────

  test('should show error message for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', CREDENTIALS.invalid.email);
    await page.fill('input[type="password"]', CREDENTIALS.invalid.password);
    await page.click('button[type="submit"]');

    // The server-error banner has role="alert" (see LoginForm.tsx)
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible({ timeout: TIMEOUTS.dataLoad });
    await expect(errorAlert).toContainText(/invalid|incorrect|credentials|failed/i);
  });

  // ── Successful login ─────────────────────────────────────

  test('should login successfully and redirect to dashboard', async ({ page }) => {
    await page.fill('input[type="email"]', CREDENTIALS.standard.email);
    await page.fill('input[type="password"]', CREDENTIALS.standard.password);
    await page.click('button[type="submit"]');

    // Should redirect to /dashboard
    await page.waitForURL('**/dashboard', { timeout: TIMEOUTS.navigation });
    expect(page.url()).toContain('/dashboard');
  });

  // ── Post-login user info ─────────────────────────────────

  test('should show user info in header after successful login', async ({ page }) => {
    await page.fill('input[type="email"]', CREDENTIALS.standard.email);
    await page.fill('input[type="password"]', CREDENTIALS.standard.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: TIMEOUTS.navigation });

    // CRMHeader renders a "Profile" button in .travelos-right
    // Clicking it opens the profile popover with the user name
    const profileBtn = page.locator('.travelos-action', { hasText: /profile/i });
    await expect(profileBtn).toBeVisible({ timeout: TIMEOUTS.dataLoad });
    await profileBtn.click();

    // Profile popover shows the user name and email
    const profilePopover = page.locator('.travelos-profile-popover');
    await expect(profilePopover).toBeVisible({ timeout: TIMEOUTS.interaction });

    // The email used to log in should appear somewhere in the popover
    await expect(profilePopover).toContainText(CREDENTIALS.standard.email);
  });

  // ── Logout ───────────────────────────────────────────────

  test('should logout successfully and return to login page', async ({ page }) => {
    // Log in first
    await page.fill('input[type="email"]', CREDENTIALS.standard.email);
    await page.fill('input[type="password"]', CREDENTIALS.standard.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: TIMEOUTS.navigation });

    // Open profile popover via the Profile action button in the header
    await page.locator('.travelos-action', { hasText: /profile/i }).click();
    await page.waitForSelector('.travelos-profile-popover', { state: 'visible' });

    // Click "Log Out" button inside the popover (.travelos-btn--logout)
    await page.locator('.travelos-btn--logout').click();

    // Auth service calls window.location.href = '/login' — wait for navigation
    await page.waitForURL('**/login', { timeout: TIMEOUTS.navigation });
    expect(page.url()).toContain('/login');

    // The login form should be visible again
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: TIMEOUTS.interaction });
  });
});
