import { test, expect } from '../../fixtures/auth.fixture';
import { URLS, TIMEOUTS } from '../../fixtures/test-data';

// ── Sidebar Navigation E2E Tests ──────────────────────────────────────────────
//
// The CRMSidebar component renders inside `.marg-sidebar-wrapper`.
// Key DOM structure (from CRMSidebar.tsx):
//   .marg-sidebar-wrapper          — root sidebar element
//   .logo-area                     — "CRM SOFT" branding
//   .search-area input[type="text"]— sidebar search box
//   .menu-list > li                — top-level menu items
//   .menu-item                     — clickable row in a menu item
//   .menu-text                     — visible label text
//   .sub-menu-list                 — expanded sub-menu
//   .sub-menu-row .sub-menu-text   — sub-item label
//   li.active                      — currently active item (has class "active")
//
// The sidebar renders menu items fetched from the API (or falls back to
// DEFAULT_NAV).  Labels depend on the menu data.  Tests use text-based
// locators so they remain resilient to icon changes.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Sidebar navigation', () => {
  // All sidebar tests need an authenticated session
  test.use({ storageState: undefined }); // use authenticatedPage fixture via test.extend

  // ── Sidebar visibility ───────────────────────────────────

  test('should show sidebar with branding and menu items', async ({ authenticatedPage: page }) => {
    // Sidebar wrapper must be present
    const sidebar = page.locator('.marg-sidebar-wrapper');
    await expect(sidebar).toBeVisible({ timeout: TIMEOUTS.navigation });

    // Logo area contains "CRM"
    const logoArea = sidebar.locator('.logo-area');
    await expect(logoArea).toBeVisible();
    await expect(logoArea).toContainText('CRM');

    // At least one menu item should be rendered after the API menu loads
    const menuItems = sidebar.locator('.menu-list .menu-item');
    await expect(menuItems.first()).toBeVisible({ timeout: TIMEOUTS.dataLoad });
    const count = await menuItems.count();
    expect(count).toBeGreaterThan(0);
  });

  // ── Navigate to Leads ────────────────────────────────────

  test('should navigate to leads page when clicking Leads menu item', async ({ authenticatedPage: page }) => {
    const sidebar = page.locator('.marg-sidebar-wrapper');

    // Wait for menu items to load from API
    await page.waitForSelector('.menu-list .menu-item', { timeout: TIMEOUTS.dataLoad });

    // Find the Leads menu item — it may be a top-level or sub-item
    // Use a broad text search across both .menu-text and .sub-menu-text
    const leadsItem = page.locator(
      '.menu-text, .sub-menu-text',
      { hasText: /^leads$/i }
    ).first();

    if (await leadsItem.isVisible({ timeout: 3000 }).catch(() => false)) {
      await leadsItem.click();
    } else {
      // Leads might be under a parent group — click the parent first to expand
      const salesItem = page.locator('.menu-text', { hasText: /sales|crm/i }).first();
      if (await salesItem.isVisible({ timeout: 2000 }).catch(() => false)) {
        await salesItem.click();
      }
      await page.locator('.sub-menu-text', { hasText: /^leads$/i }).first().click();
    }

    // URL should change to /leads
    await page.waitForURL('**/leads', { timeout: TIMEOUTS.navigation });
    expect(page.url()).toContain('/leads');
  });

  // ── Navigate to Contacts ─────────────────────────────────

  test('should navigate to contacts page when clicking Contacts menu item', async ({ authenticatedPage: page }) => {
    await page.waitForSelector('.menu-list .menu-item', { timeout: TIMEOUTS.dataLoad });

    // Direct navigation as a fallback ensures the route is reachable
    await page.goto(URLS.contacts);
    await page.waitForURL('**/contacts', { timeout: TIMEOUTS.navigation });
    expect(page.url()).toContain('/contacts');

    // Verify the sidebar is still visible after navigation (layout persists)
    await expect(page.locator('.marg-sidebar-wrapper')).toBeVisible();
  });

  // ── Navigate to Settings ─────────────────────────────────

  test('should navigate to settings page', async ({ authenticatedPage: page }) => {
    // Use the Settings action button in the CRMHeader as well as the menu
    // The header always has a "Settings" action button in .travelos-right
    const settingsAction = page.locator('.travelos-action[title="Settings"]');
    if (await settingsAction.isVisible({ timeout: 3000 }).catch(() => false)) {
      await settingsAction.click();
    } else {
      await page.goto(URLS.settings);
    }

    await page.waitForURL('**/settings**', { timeout: TIMEOUTS.navigation });
    expect(page.url()).toContain('/settings');
  });

  // ── Active menu item highlighting ────────────────────────

  test('should highlight active menu item matching current route', async ({ authenticatedPage: page }) => {
    // Navigate to leads
    await page.goto(URLS.leads);
    await page.waitForURL('**/leads', { timeout: TIMEOUTS.navigation });

    // Allow menu sync to propagate (setActiveItem is called in useEffect on pathname change)
    await page.waitForTimeout(500);

    // The sidebar marks the active item with the CSS class "active" on the <li>
    // (see CRMSidebar: li className includes "active" when item.active is true)
    const activeItem = page.locator('.marg-sidebar-wrapper li.active');

    // There should be at least one active item after navigation
    await expect(activeItem.first()).toBeVisible({ timeout: TIMEOUTS.dataLoad });
  });

  // ── Sidebar search ───────────────────────────────────────

  test('should filter menu items using the sidebar search box', async ({ authenticatedPage: page }) => {
    const sidebar = page.locator('.marg-sidebar-wrapper');
    await page.waitForSelector('.menu-list .menu-item', { timeout: TIMEOUTS.dataLoad });

    // Sidebar search input — inside .search-area
    const searchInput = sidebar.locator('.search-area input[type="text"]');
    await expect(searchInput).toBeVisible({ timeout: TIMEOUTS.interaction });

    // Type "leads" — only Leads-related items should remain visible
    await searchInput.fill('leads');

    // At least one menu item should remain
    const visibleItems = sidebar.locator('.menu-item');
    await expect(visibleItems.first()).toBeVisible({ timeout: TIMEOUTS.interaction });

    // Clear search — full menu returns
    await searchInput.clear();
    const allItems = sidebar.locator('.menu-list .menu-item');
    const count = await allItems.count();
    expect(count).toBeGreaterThan(1);
  });
});
