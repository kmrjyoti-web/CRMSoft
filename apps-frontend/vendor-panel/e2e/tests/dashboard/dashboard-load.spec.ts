import { test, expect } from '../../fixtures/auth.fixture';
import { TIMEOUTS } from '../../fixtures/test-data';

// ── Dashboard Load E2E Tests ──────────────────────────────────────────────────
//
// The Vendor Panel dashboard (src/app/(dashboard)/page.tsx) is the root '/' route.
// After login, the authenticated user lands here.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Dashboard', () => {
  test('should load dashboard after login', async ({ authenticatedPage: page }) => {
    // After login, should be on the dashboard (root or /vendor-dashboard)
    const isOnDashboard =
      page.url().endsWith('/') ||
      page.url().includes('/vendor-dashboard');
    expect(isOnDashboard).toBeTruthy();
  });

  test('should show main navigation sidebar or menu', async ({ authenticatedPage: page }) => {
    // The (dashboard) layout renders a sidebar with navigation links
    const nav = page.locator('nav, aside, [class*="sidebar"], [class*="nav"]').first();
    await expect(nav).toBeVisible({ timeout: TIMEOUTS.dataLoad });
  });

  test('should display dashboard content without error', async ({ authenticatedPage: page }) => {
    // No error boundary or error page should be visible
    const errorPage = page.locator(
      '[class*="error-page"], h1:has-text("Error"), h1:has-text("Something went wrong")'
    );
    await expect(errorPage).not.toBeVisible({ timeout: TIMEOUTS.interaction });

    // Main content area should exist
    const main = page.locator('main, [class*="main"], [class*="content"], [class*="dashboard"]').first();
    await expect(main).toBeVisible({ timeout: TIMEOUTS.dataLoad });
  });

  test('should show page title or heading', async ({ authenticatedPage: page }) => {
    // Any heading on the dashboard
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: TIMEOUTS.dataLoad });
  });
});
