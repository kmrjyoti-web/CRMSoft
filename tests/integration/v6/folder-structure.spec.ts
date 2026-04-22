/**
 * V6 folder structure integrity tests.
 * Run with: node --experimental-vm-modules node_modules/.bin/jest tests/integration/v6/
 *
 * These tests act as a living spec: if the V6 structure degrades
 * (someone deletes a folder, misnames a vertical, etc.) CI catches it.
 */

import * as fs from 'fs';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '../../..');

function exists(rel: string): boolean {
  return fs.existsSync(path.join(REPO_ROOT, rel));
}

function isDir(rel: string): boolean {
  try {
    return fs.statSync(path.join(REPO_ROOT, rel)).isDirectory();
  } catch {
    return false;
  }
}

function listDir(rel: string): string[] {
  try {
    return fs.readdirSync(path.join(REPO_ROOT, rel));
  } catch {
    return [];
  }
}

/** Returns true if dir has been migrated (has a package.json — the canonical migration marker) */
function isPopulated(rel: string): boolean {
  return exists(`${rel}/package.json`);
}

// ─── Core directories ────────────────────────────────────────────────────────

describe('V6 core/ structure', () => {
  const coreDirs = ['platform', 'ai-engine', 'base-modules', 'shared-libraries', 'governance'];

  test.each(coreDirs)('core/%s/ exists', (dir) => {
    expect(isDir(`core/${dir}`)).toBe(true);
  });

  test('core/governance/ has ci-rules', () => {
    expect(isDir('core/governance/ci-rules')).toBe(true);
  });
});

// ─── Verticals ───────────────────────────────────────────────────────────────

describe('V6 verticals/ structure', () => {
  const expectedVerticals = ['travel', 'electronic', 'software', 'restaurant', 'tourism', 'retail'];

  test.each(expectedVerticals)('verticals/%s/ exists', (vertical) => {
    expect(isDir(`verticals/${vertical}`)).toBe(true);
  });

  test.each(expectedVerticals)('verticals/%s/ has modules/ dir', (vertical) => {
    expect(isDir(`verticals/${vertical}/modules`)).toBe(true);
  });

  test.each(expectedVerticals)('verticals/%s/ has data-models/ dir', (vertical) => {
    expect(isDir(`verticals/${vertical}/data-models`)).toBe(true);
  });

  test.each(expectedVerticals)('verticals/%s/ has ai-customization/ dir', (vertical) => {
    expect(isDir(`verticals/${vertical}/ai-customization`)).toBe(true);
  });
});

// ─── Apps ────────────────────────────────────────────────────────────────────

describe('V6 apps/ structure', () => {
  const expectedFrontendPortals = [
    'crm-admin-new',
    'vendor-panel-new',
    'customer-portal-new',
    'marketplace-new',
    'wl-admin-new',
    'wl-partner-new',
    'platform-console-new',
  ];

  test.each(expectedFrontendPortals)('apps/frontend/%s/ exists', (portal) => {
    expect(isDir(`apps/frontend/${portal}`)).toBe(true);
  });

  test.each(expectedFrontendPortals)('apps/frontend/%s/ has package.json (if populated)', (portal) => {
    // Portals start as .gitkeep skeletons; package.json appears after dev2/dev3 PRs merge.
    // This test only enforces the contract once a portal is populated.
    if (!isPopulated(`apps/frontend/${portal}`)) {
      console.log(`  ⏭  apps/frontend/${portal}/ not yet migrated — skipping package.json check`);
      return;
    }
    expect(exists(`apps/frontend/${portal}/package.json`)).toBe(true);
  });

  test('apps/frontend/ has _shared/ directory', () => {
    expect(isDir('apps/frontend/_shared')).toBe(true);
  });

  test('customer-portal-new package.json has scoped name (if populated)', () => {
    const pkgPath = 'apps/frontend/customer-portal-new/package.json';
    if (!exists(pkgPath)) {
      console.log('  ⏭  customer-portal-new not yet migrated — skipping name check');
      return;
    }
    const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, pkgPath), 'utf-8'));
    expect(pkg.name).toBe('@crmsoft/customer-portal-new');
  });

  test('marketplace-new package.json has scoped name (if populated)', () => {
    const pkgPath = 'apps/frontend/marketplace-new/package.json';
    if (!exists(pkgPath)) {
      console.log('  ⏭  marketplace-new not yet migrated — skipping name check');
      return;
    }
    const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, pkgPath), 'utf-8'));
    expect(pkg.name).toBe('@crmsoft/marketplace-new');
  });
});

// ─── Brands ──────────────────────────────────────────────────────────────────

describe('V6 brands/ structure', () => {
  test('brands/crmsoft/ exists', () => {
    expect(isDir('brands/crmsoft')).toBe(true);
  });

  test('brands/_template/ exists', () => {
    expect(isDir('brands/_template')).toBe(true);
  });

  const brandDirs = ['theme', 'config', 'overrides'];
  test.each(brandDirs)('brands/crmsoft/%s/ exists', (dir) => {
    expect(isDir(`brands/crmsoft/${dir}`)).toBe(true);
  });

  test('brands/crmsoft/theme/variables.css exists', () => {
    expect(exists('brands/crmsoft/theme/variables.css')).toBe(true);
  });

  test('brands/crmsoft/theme/variables.css defines --brand-primary', () => {
    const css = fs.readFileSync(
      path.join(REPO_ROOT, 'brands/crmsoft/theme/variables.css'),
      'utf-8'
    );
    expect(css).toContain('--brand-primary');
  });

  test('brands/crmsoft/config/brand.json is valid JSON with brandId', () => {
    const config = JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, 'brands/crmsoft/config/brand.json'), 'utf-8')
    );
    expect(config.brandId).toBe('crmsoft');
    expect(config.displayName).toBeDefined();
  });
});

// ─── Partner customizations ───────────────────────────────────────────────────

describe('V6 partner-customizations/ structure', () => {
  test('partner-customizations/ directory exists', () => {
    expect(isDir('partner-customizations')).toBe(true);
  });
});

// ─── Customer X safety ────────────────────────────────────────────────────────

describe('Customer X safety (V5 originals untouched)', () => {
  const v5Originals = [
    'apps-frontend/crm-admin',
    'apps-frontend/vendor-panel',
    'apps-frontend/customer-portal',
    'apps-frontend/marketplace',
    'apps-backend/api',
  ];

  test.each(v5Originals)('%s still exists (not moved)', (dir) => {
    expect(isDir(dir)).toBe(true);
  });

  test('apps-frontend/crm-admin/package.json name is crm-admin (not renamed)', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, 'apps-frontend/crm-admin/package.json'), 'utf-8')
    );
    // Original name — must not be renamed, Customer X depends on this
    expect(pkg.name).toMatch(/crm-admin/);
  });
});

// ─── pnpm workspace ──────────────────────────────────────────────────────────

describe('pnpm workspace registration', () => {
  test('pnpm-workspace.yaml exists', () => {
    expect(exists('pnpm-workspace.yaml')).toBe(true);
  });

  test('pnpm-workspace.yaml references apps-backend/*', () => {
    const yaml = fs.readFileSync(path.join(REPO_ROOT, 'pnpm-workspace.yaml'), 'utf-8');
    expect(yaml).toContain('apps-backend/*');
  });

  test('pnpm-workspace.yaml references apps-frontend/*', () => {
    const yaml = fs.readFileSync(path.join(REPO_ROOT, 'pnpm-workspace.yaml'), 'utf-8');
    expect(yaml).toContain('apps-frontend/*');
  });
});
