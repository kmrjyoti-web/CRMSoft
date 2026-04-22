#!/usr/bin/env node
/**
 * Scans the (dashboard) route group to discover all vendor routes.
 * Generates src/config/discovered-routes.json used by the auto-menu service.
 *
 * Usage: node scripts/generate-routes.mjs
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon mapping based on route folder name
const ICON_MAP = {
  dashboard: 'LayoutDashboard',
  settings: 'Settings',
  profile: 'User',
  // Software Vendor features
  'vendor-dashboard': 'BarChart3',
  plans: 'CreditCard',
  modules: 'Layers',
  packages: 'Package',
  licenses: 'Key',
  partners: 'Users',
  wallet: 'Wallet',
  'wallet-analytics': 'PieChart',
  offers: 'Gift',
  'recharge-plans': 'Zap',
  coupons: 'Ticket',
  'service-rates': 'Receipt',
  tenants: 'Building',
  'ai-tokens': 'Brain',
  'subscription-analytics': 'TrendingUp',
  // Dev-ops features
  'error-logs': 'AlertTriangle',
  'audit-logs': 'FileSearch',
  'system-health': 'Activity',
  'module-builder': 'Hammer',
  webhooks: 'Webhook',
  'dev-requests': 'ClipboardList',
  'db-admin': 'Database',
  // Developer Tools
  'dev-tools': 'Code',
  'ui-kit': 'Palette',
  'api-docs': 'BookOpen',
};

// Module requirements for gating (folder name → required module key)
// Vendor portal is the admin tool — nothing should be locked here
const MODULE_REQUIREMENTS = {};

// Section grouping for sidebar
const SECTION_MAP = {
  'vendor-dashboard': 'SOFTWARE_VENDOR',
  plans: 'SOFTWARE_VENDOR',
  tenants: 'SOFTWARE_VENDOR',
  licenses: 'SOFTWARE_VENDOR',
  offers: 'SOFTWARE_VENDOR',
  modules: 'SOFTWARE_VENDOR',
  packages: 'SOFTWARE_VENDOR',
  'recharge-plans': 'SOFTWARE_VENDOR',
  coupons: 'SOFTWARE_VENDOR',
  'service-rates': 'SOFTWARE_VENDOR',
  partners: 'SOFTWARE_VENDOR',
  wallet: 'SOFTWARE_VENDOR',
  'wallet-analytics': 'SOFTWARE_VENDOR',
  'ai-tokens': 'SOFTWARE_VENDOR',
  'subscription-analytics': 'SOFTWARE_VENDOR',
  'error-logs': 'DEV_OPS',
  'audit-logs': 'DEV_OPS',
  'system-health': 'DEV_OPS',
  webhooks: 'DEV_OPS',
  'db-admin': 'DEV_OPS',
  'dev-requests': 'DEV_OPS',
  'module-builder': 'DEV_OPS',
  'dev-tools': 'DEVELOPER_TOOLS',
  profile: 'OTHER',
  settings: 'OTHER',
};

function pathToLabel(routePath) {
  const parts = routePath.split('/').filter(Boolean);
  const lastPart = parts[parts.length - 1] || 'Dashboard';
  return lastPart
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function scanRoutes(dir, basePath = '') {
  const routes = [];
  if (!fs.existsSync(dir)) return routes;

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (!stat.isDirectory()) continue;
    // Skip dynamic route folders — they're detail pages, not menu items
    if (item.startsWith('[') && item.endsWith(']')) continue;
    // Skip 'new' folders — they're action pages
    if (item === 'new') continue;

    const routePath = `${basePath}/${item}`;
    const pageFile = path.join(fullPath, 'page.tsx');

    if (fs.existsSync(pageFile)) {
      const key = routePath.slice(1).replace(/\//g, '.');
      const parentKey = basePath ? basePath.slice(1).replace(/\//g, '.') : undefined;
      const folderName = item;

      routes.push({
        key,
        label: pathToLabel(routePath),
        path: routePath,
        icon: ICON_MAP[folderName] || 'Circle',
        parentKey: parentKey || undefined,
        moduleKey: MODULE_REQUIREMENTS[folderName] || undefined,
        section: SECTION_MAP[folderName] || 'OTHER',
        displayOrder: routes.length + 1,
      });
    }

    // Recurse into subdirectories
    routes.push(...scanRoutes(fullPath, routePath));
  }

  return routes;
}

// Main
const dashboardDir = path.join(__dirname, '../src/app/(dashboard)');
const routes = scanRoutes(dashboardDir);

// Add the root dashboard route
const dashboardPage = path.join(dashboardDir, 'page.tsx');
if (fs.existsSync(dashboardPage)) {
  routes.unshift({
    key: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
    parentKey: undefined,
    moduleKey: undefined,
    section: 'DEV_OPS',
    displayOrder: 0,
  });
}

// Re-assign display orders after sorting
routes.sort((a, b) => {
  const depthA = a.path.split('/').length;
  const depthB = b.path.split('/').length;
  if (depthA !== depthB) return depthA - depthB;
  return a.path.localeCompare(b.path);
});

routes.forEach((r, i) => {
  r.displayOrder = i + 1;
});

const output = {
  generatedAt: new Date().toISOString(),
  totalRoutes: routes.length,
  routes,
};

const outPath = path.join(__dirname, '../src/config/discovered-routes.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log(`Generated ${routes.length} routes to src/config/discovered-routes.json`);
routes.forEach((r) => {
  const locked = r.moduleKey ? `[${r.moduleKey}]` : '';
  console.log(`  ${r.path} -> ${r.label} ${locked}`);
});
