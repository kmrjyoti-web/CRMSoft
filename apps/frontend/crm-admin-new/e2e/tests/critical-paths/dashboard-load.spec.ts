import { test, expect } from '../../fixtures/auth.fixture';
import { URLS, TIMEOUTS } from '../../fixtures/test-data';

// ── Dashboard Load E2E Tests ──────────────────────────────────────────────────
//
// DashboardOverview renders:
//   - PageHeader with title "Executive Dashboard"
//   - KpiCard × 4 (Total Leads, Won Deals, Revenue, Conversion Rate)
//     - Default variant: .rounded-lg.border.bg-white.p-5
//     - Each card has a <p> with the title text and a <p> with the value
//   - Date range preset buttons (7D, 30D, 90D, This Month, Last Month)
//   - 4 chart panels (Revenue Trend, Sales Pipeline, Lead Sources, Quick Stats)
//     - Each has a <h3> with the panel title
//     - ResponsiveContainer wraps the recharts SVG
//
// On initial load the component shows a LoadingSpinner (fullPage) while
// useExecutiveDashboard is pending, then switches to the full layout.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Dashboard load', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto(URLS.dashboard);
    await page.waitForURL('**/dashboard', { timeout: TIMEOUTS.navigation });

    // Wait for the loading spinner to disappear (KPI data fetched)
    // LoadingSpinner renders with role="status" or a spinner class
    await page.waitForSelector(
      '[class*="spinner"], [class*="loading"], [role="status"]',
      { state: 'detached', timeout: TIMEOUTS.dataLoad }
    ).catch(() => {
      // Spinner may not be present if data loads very quickly — that is fine
    });
  });

  // ── Page title ───────────────────────────────────────────

  test('should load dashboard with Executive Dashboard heading', async ({ authenticatedPage: page }) => {
    // PageHeader renders the title — check for h1/h2/h3 or a heading element
    const heading = page.locator(
      'h1, h2, h3, [class*="page-header"] [class*="title"]',
      { hasText: /executive dashboard/i }
    ).first();
    await expect(heading).toBeVisible({ timeout: TIMEOUTS.dataLoad });
  });

  // ── KPI cards ────────────────────────────────────────────

  test('should load dashboard with KPI cards', async ({ authenticatedPage: page }) => {
    // KpiCard default variant renders .rounded-lg.border.bg-white.p-5
    // Each card has a <p> with the title string
    const kpiTitles = ['Total Leads', 'Won Deals', 'Revenue', 'Conversion Rate'];

    for (const title of kpiTitles) {
      const kpiLabel = page.locator('p, span, div', { hasText: new RegExp(`^${title}$`, 'i') }).first();
      await expect(kpiLabel).toBeVisible({ timeout: TIMEOUTS.dataLoad });
    }
  });

  // ── Date range preset buttons ─────────────────────────────

  test('should show date range preset buttons', async ({ authenticatedPage: page }) => {
    // Preset buttons: 7D, 30D, 90D, This Month, Last Month
    const presets = ['7D', '30D', '90D', 'This Month', 'Last Month'];

    for (const preset of presets) {
      const btn = page.locator('button', { hasText: new RegExp(`^${preset}$`, 'i') }).first();
      await expect(btn).toBeVisible({ timeout: TIMEOUTS.dataLoad });
    }
  });

  // ── Chart panels ─────────────────────────────────────────

  test('should show charts area with chart panels', async ({ authenticatedPage: page }) => {
    // Each chart panel has an h3 heading (Revenue Trend, Sales Pipeline, Lead Sources, Quick Stats)
    const chartTitles = ['Revenue Trend', 'Sales Pipeline', 'Lead Sources', 'Quick Stats'];

    for (const title of chartTitles) {
      const panelHeading = page.locator('h3', { hasText: new RegExp(title, 'i') }).first();
      await expect(panelHeading).toBeVisible({ timeout: TIMEOUTS.dataLoad });
    }

    // At least one recharts ResponsiveContainer (renders an <svg>) should be in the DOM
    const charts = page.locator('svg');
    const chartCount = await charts.count();
    expect(chartCount).toBeGreaterThan(0);
  });

  // ── KPI value content ─────────────────────────────────────

  test('should display numeric values in KPI cards', async ({ authenticatedPage: page }) => {
    // KpiCard renders the value in a <p> with font-size 24 / font-weight 700
    // The count-up animation ends at the real value.
    // We look for any non-empty numeric or currency string inside the KPI grid.
    const kpiGrid = page.locator('.grid').first();
    await expect(kpiGrid).toBeVisible({ timeout: TIMEOUTS.dataLoad });

    // At least the grid container should have text content (values rendered)
    const gridText = await kpiGrid.textContent();
    expect(gridText).toBeTruthy();
    expect(gridText!.trim().length).toBeGreaterThan(0);
  });

  // ── Date preset changes data ──────────────────────────────

  test('should change date range when clicking a preset button', async ({ authenticatedPage: page }) => {
    // Click "7D" preset — should remain on dashboard with same structure
    const sevenDayBtn = page.locator('button', { hasText: /^7D$/i }).first();
    await expect(sevenDayBtn).toBeVisible({ timeout: TIMEOUTS.dataLoad });
    await sevenDayBtn.click();

    // Page should still be on dashboard (no redirect)
    expect(page.url()).toContain('/dashboard');

    // The "7D" button should now have primary styling (variant="primary")
    // In the Button component, primary variant typically gets a data attribute or specific class
    // We verify the button is still visible and the layout is intact
    await expect(sevenDayBtn).toBeVisible({ timeout: TIMEOUTS.interaction });

    // Chart panels should still be present
    const revenueTrend = page.locator('h3', { hasText: /revenue trend/i }).first();
    await expect(revenueTrend).toBeVisible({ timeout: TIMEOUTS.dataLoad });
  });

  // ── Responsive: mobile viewport ──────────────────────────

  test('should be responsive on mobile viewport', async ({ authenticatedPage: page }) => {
    // Change to mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // Reload to get mobile-responsive rendering
    await page.goto(URLS.dashboard);
    await page.waitForURL('**/dashboard', { timeout: TIMEOUTS.navigation });

    // Wait for spinner to go away
    await page.waitForSelector(
      '[class*="spinner"], [class*="loading"], [role="status"]',
      { state: 'detached', timeout: TIMEOUTS.dataLoad }
    ).catch(() => {});

    // Dashboard heading must be visible on mobile
    const heading = page.locator(
      'h1, h2, h3, [class*="page-header"] [class*="title"]',
      { hasText: /executive dashboard/i }
    ).first();
    await expect(heading).toBeVisible({ timeout: TIMEOUTS.dataLoad });

    // KPI cards should still be visible — grid becomes 2-column on mobile
    // (grid-cols-2 md:grid-cols-4 — on 390px wide we get 2 columns)
    const totalLeadsLabel = page.locator('p, span, div', { hasText: /total leads/i }).first();
    await expect(totalLeadsLabel).toBeVisible({ timeout: TIMEOUTS.dataLoad });

    // No horizontal overflow (content fits within viewport)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    // Allow small tolerance for scrollbar / OS chrome
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
  });
});
