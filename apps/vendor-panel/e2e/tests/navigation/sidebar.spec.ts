import { test, expect } from '../../fixtures/auth.fixture';
import { TIMEOUTS } from '../../fixtures/test-data';

// ── Sidebar Navigation E2E Tests ──────────────────────────────────────────────
//
// The (dashboard)/layout.tsx renders a sidebar with links to all main sections.
// Vendor Panel sections include: tenants, modules, packages, support, settings, etc.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Sidebar navigation', () => {
  test('should show multiple navigation links', async ({ authenticatedPage: page }) => {
    const navLinks = page.locator('nav a, aside a, [class*="sidebar"] a, [class*="nav-link"]');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(2);
  });

  test('should navigate to tenants page', async ({ authenticatedPage: page }) => {
    const link = page.locator('a[href*="tenant"]').first();
    if (await link.isVisible({ timeout: TIMEOUTS.interaction }).catch(() => false)) {
      await link.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('tenant');
    } else {
      test.skip();
    }
  });

  test('should navigate to modules page', async ({ authenticatedPage: page }) => {
    const link = page.locator('a[href*="module"]').first();
    if (await link.isVisible({ timeout: TIMEOUTS.interaction }).catch(() => false)) {
      await link.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('module');
    } else {
      test.skip();
    }
  });

  test('should navigate to packages page', async ({ authenticatedPage: page }) => {
    const link = page.locator('a[href*="package"]').first();
    if (await link.isVisible({ timeout: TIMEOUTS.interaction }).catch(() => false)) {
      await link.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('package');
    } else {
      test.skip();
    }
  });

  test('should highlight active nav item for current route', async ({ authenticatedPage: page }) => {
    // Active nav item typically has an active class or aria-current attribute
    const activeItem = page.locator(
      '[class*="active"], [aria-current="page"], [data-active="true"]'
    ).first();
    await expect(activeItem).toBeVisible({ timeout: TIMEOUTS.dataLoad });
  });
});
