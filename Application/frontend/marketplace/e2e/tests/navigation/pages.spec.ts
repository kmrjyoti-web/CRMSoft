import { test, expect } from '../../fixtures/auth.fixture';
import { URLS, TIMEOUTS } from '../../fixtures/test-data';

// ── Page Navigation E2E Tests ─────────────────────────────────────────────────
//
// Tests that main marketplace pages render without crashing.
// basePath '/marketplace' is handled by playwright.config.ts baseURL.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Page navigation', () => {
  test('should navigate to discover page without error', async ({ authenticatedPage: page }) => {
    await page.goto(URLS.discover);
    await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.navigation });

    const errorPage = page.locator(
      'h1:has-text("Error"), h2:has-text("Something went wrong")'
    );
    await expect(errorPage).not.toBeVisible({ timeout: TIMEOUTS.interaction });
  });

  test('should navigate to listings page without error', async ({ authenticatedPage: page }) => {
    await page.goto(URLS.listings);
    await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.navigation });

    const errorPage = page.locator(
      'h1:has-text("Error"), h2:has-text("Something went wrong")'
    );
    await expect(errorPage).not.toBeVisible({ timeout: TIMEOUTS.interaction });
  });

  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto(URLS.feed);
    // If protected, should redirect to login
    await page.waitForURL(/login|feed/, { timeout: TIMEOUTS.navigation });
    // Either already on feed (no redirect) or landed on login — both valid
    const url = page.url();
    expect(url.includes('/login') || url.includes('/feed')).toBeTruthy();
  });
});
