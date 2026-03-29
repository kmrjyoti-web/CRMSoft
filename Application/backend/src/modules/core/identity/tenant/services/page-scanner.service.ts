import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

interface ScannedPage {
  routePath: string;
  routePattern: string;
  portal: string;
  filePath: string;
  componentName: string | null;
  hasParams: boolean;
  paramNames: string[];
  isNested: boolean;
  parentRoute: string | null;
  pageType: string | null;
  category: string | null;
  friendlyName: string | null;
  showInMenu: boolean;
  isAutoDiscovered: boolean;
  lastScannedAt: Date;
}

// Map first route segment to category
const CATEGORY_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  contacts: 'CRM',
  leads: 'CRM',
  organizations: 'CRM',
  'raw-contacts': 'CRM',
  activities: 'CRM',
  'follow-ups': 'CRM',
  'tour-plans': 'CRM',
  demos: 'CRM',
  quotations: 'Sales',
  finance: 'Finance',
  products: 'Products',
  'post-sales': 'Post-Sales',
  communication: 'Communication',
  email: 'Communication',
  whatsapp: 'Communication',
  campaigns: 'Communication',
  workflows: 'Automation',
  calendar: 'Calendar',
  tasks: 'Tasks',
  reminders: 'Tasks',
  reports: 'Reports',
  settings: 'Settings',
  admin: 'Admin',
  marketplace: 'Marketplace',
  plugins: 'Plugins',
  notifications: 'Notifications',
  documents: 'Documents',
  verification: 'Verification',
  sync: 'Sync',
  performance: 'Performance',
  ownership: 'Ownership',
  approvals: 'Approvals',
  'api-gateway': 'Developer',
  'recycle-bin': 'Settings',
  import: 'Data',
  export: 'Data',
  help: 'Help',
  onboarding: 'Onboarding',
};

@Injectable()
export class PageScannerService {
  private readonly logger = new Logger(PageScannerService.name);

  // Paths relative to project root
  private readonly crmAdminBase: string;
  private readonly vendorPanelBase: string;

  constructor(private readonly prisma: PrismaService) {
    // process.cwd() = API directory; go one level up to project root
    const projectRoot = path.resolve(process.cwd(), '..');
    this.crmAdminBase = path.join(projectRoot, 'UI/crm-admin/src/app');
    this.vendorPanelBase = path.join(projectRoot, 'UI/vendor-panel/src/app');
  }

  async scanAndRegister(): Promise<{ total: number; created: number; updated: number }> {
    const results = { total: 0, created: 0, updated: 0 };

    const crmPages = this.scanDirectory(this.crmAdminBase, 'crm');
    const vendorPages = this.scanDirectory(this.vendorPanelBase, 'vendor');
    const allPages = [...crmPages, ...vendorPages];
    results.total = allPages.length;

    for (const page of allPages) {
      const existing = await this.prisma.platform.pageRegistry.findUnique({
        where: { routePath: `${page.portal}:${page.routePath}` },
      });

      // Use portal:routePath as unique key to avoid collisions between portals
      const uniqueRoutePath = `${page.portal}:${page.routePath}`;

      if (!existing) {
        await this.prisma.platform.pageRegistry.create({
          data: { ...page, routePath: uniqueRoutePath },
        });
        results.created++;
      } else {
        // Only update auto-discovered fields, preserve vendor-set fields
        await this.prisma.platform.pageRegistry.update({
          where: { routePath: uniqueRoutePath },
          data: {
            filePath: page.filePath,
            hasParams: page.hasParams,
            paramNames: page.paramNames,
            isNested: page.isNested,
            parentRoute: page.parentRoute,
            componentName: page.componentName,
            lastScannedAt: new Date(),
          },
        });
        results.updated++;
      }
    }

    return results;
  }

  private scanDirectory(basePath: string, portal: string): ScannedPage[] {
    const pages: ScannedPage[] = [];

    if (!fs.existsSync(basePath)) {
      this.logger.warn(`Directory not found: ${basePath}`);
      return pages;
    }

    const pageFiles = this.findPageFiles(basePath);

    for (const filePath of pageFiles) {
      const relativePath = path.relative(basePath, filePath);
      const routePath = this.filePathToRoute(relativePath);

      // Skip auth pages (login, register, forgot-password)
      if (routePath.startsWith('/login') || routePath.startsWith('/register') || routePath.startsWith('/forgot-password')) {
        continue;
      }

      const params = this.extractParams(routePath);
      const segments = routePath.split('/').filter(Boolean);
      const firstSegment = segments[0]?.replace(/:/g, '') || '';
      const isNested = segments.length > 2 || (segments.length > 1 && params.length > 0);
      const parentRoute = isNested ? '/' + segments[0] : null;

      const pageType = this.inferPageType(routePath, segments);
      const category = CATEGORY_MAP[firstSegment] || (portal === 'vendor' ? 'Vendor' : 'Other');
      const friendlyName = this.inferFriendlyName(routePath, segments);
      const showInMenu = !params.length && !routePath.includes('/edit') && !routePath.includes('/new');

      const componentName = this.extractComponentName(filePath);

      pages.push({
        routePath,
        routePattern: routePath.replace(/\[(\w+)\]/g, ':$1'),
        portal,
        filePath: relativePath,
        componentName,
        hasParams: params.length > 0,
        paramNames: params,
        isNested,
        parentRoute,
        pageType,
        category,
        friendlyName,
        showInMenu,
        isAutoDiscovered: true,
        lastScannedAt: new Date(),
      });
    }

    return pages;
  }

  private findPageFiles(dir: string): string[] {
    const results: string[] = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...this.findPageFiles(fullPath));
        } else if (entry.name === 'page.tsx') {
          results.push(fullPath);
        }
      }
    } catch {
      // Skip inaccessible directories
    }
    return results;
  }

  private filePathToRoute(relativePath: string): string {
    let route = relativePath
      .replace(/page\.tsx$/, '')
      .replace(/\\/g, '/');

    // Remove route groups like (main), (auth), (dashboard), (vendor)
    route = route.replace(/\([^)]+\)\//g, '');

    // Remove trailing slash
    route = route.replace(/\/$/, '') || '/';

    // Ensure leading slash
    if (!route.startsWith('/')) route = '/' + route;

    return route;
  }

  private extractParams(routePath: string): string[] {
    const matches = routePath.match(/\[(\w+)\]/g) || [];
    return matches.map((m) => m.replace(/[[\]]/g, ''));
  }

  private inferPageType(routePath: string, segments: string[]): string {
    const last = segments[segments.length - 1] || '';
    if (last === 'new' || last === 'create') return 'CREATE';
    if (last === 'edit') return 'EDIT';
    if (last === 'analytics' || last === 'dashboard' || last === 'overview') return 'DASHBOARD';
    if (last === 'designer' || last === 'builder') return 'WIZARD';
    if (routePath.includes('/settings')) return 'SETTINGS';
    if (routePath.includes('/reports')) return 'REPORT';
    if (last.startsWith('[') || last.startsWith(':')) return 'DETAIL';
    if (routePath === '/') return 'DASHBOARD';
    return 'LIST';
  }

  private inferFriendlyName(routePath: string, segments: string[]): string {
    if (routePath === '/') return 'Home';
    const parts = segments
      .filter((s) => !s.startsWith('[') && !s.startsWith(':'))
      .map((s) =>
        s
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      );
    return parts.join(' › ') || 'Page';
  }

  private extractComponentName(filePath: string): string | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      // Match: export default function FooPage
      const match = content.match(/export\s+default\s+function\s+(\w+)/);
      if (match) return match[1];
      // Match: export function FooPage
      const match2 = content.match(/export\s+function\s+(\w+)/);
      if (match2) return match2[1];
    } catch {
      // File read error
    }
    return null;
  }
}
