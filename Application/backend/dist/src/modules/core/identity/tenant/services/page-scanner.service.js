"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PageScannerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageScannerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const fs = require("fs");
const path = require("path");
const CATEGORY_MAP = {
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
let PageScannerService = PageScannerService_1 = class PageScannerService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PageScannerService_1.name);
        const monorepoRoot = path.resolve(process.cwd(), '../..');
        this.crmAdminBase = path.join(monorepoRoot, 'Customer/frontend/crm-admin/src/app');
        this.vendorPanelBase = path.join(monorepoRoot, 'Vendor/frontend/vendor-panel/src/app');
    }
    async scanAndRegister() {
        const results = { total: 0, created: 0, updated: 0 };
        const crmPages = this.scanDirectory(this.crmAdminBase, 'crm');
        const vendorPages = this.scanDirectory(this.vendorPanelBase, 'vendor');
        const allPages = [...crmPages, ...vendorPages];
        results.total = allPages.length;
        for (const page of allPages) {
            const existing = await this.prisma.platform.pageRegistry.findUnique({
                where: { routePath: `${page.portal}:${page.routePath}` },
            });
            const uniqueRoutePath = `${page.portal}:${page.routePath}`;
            if (!existing) {
                await this.prisma.platform.pageRegistry.create({
                    data: { ...page, routePath: uniqueRoutePath },
                });
                results.created++;
            }
            else {
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
    scanDirectory(basePath, portal) {
        const pages = [];
        if (!fs.existsSync(basePath)) {
            this.logger.warn(`Directory not found: ${basePath}`);
            return pages;
        }
        const pageFiles = this.findPageFiles(basePath);
        for (const filePath of pageFiles) {
            const relativePath = path.relative(basePath, filePath);
            const routePath = this.filePathToRoute(relativePath);
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
    findPageFiles(dir) {
        const results = [];
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    results.push(...this.findPageFiles(fullPath));
                }
                else if (entry.name === 'page.tsx') {
                    results.push(fullPath);
                }
            }
        }
        catch {
        }
        return results;
    }
    filePathToRoute(relativePath) {
        let route = relativePath
            .replace(/page\.tsx$/, '')
            .replace(/\\/g, '/');
        route = route.replace(/\([^)]+\)\//g, '');
        route = route.replace(/\/$/, '') || '/';
        if (!route.startsWith('/'))
            route = '/' + route;
        return route;
    }
    extractParams(routePath) {
        const matches = routePath.match(/\[(\w+)\]/g) || [];
        return matches.map((m) => m.replace(/[[\]]/g, ''));
    }
    inferPageType(routePath, segments) {
        const last = segments[segments.length - 1] || '';
        if (last === 'new' || last === 'create')
            return 'CREATE';
        if (last === 'edit')
            return 'EDIT';
        if (last === 'analytics' || last === 'dashboard' || last === 'overview')
            return 'DASHBOARD';
        if (last === 'designer' || last === 'builder')
            return 'WIZARD';
        if (routePath.includes('/settings'))
            return 'SETTINGS';
        if (routePath.includes('/reports'))
            return 'REPORT';
        if (last.startsWith('[') || last.startsWith(':'))
            return 'DETAIL';
        if (routePath === '/')
            return 'DASHBOARD';
        return 'LIST';
    }
    inferFriendlyName(routePath, segments) {
        if (routePath === '/')
            return 'Home';
        const parts = segments
            .filter((s) => !s.startsWith('[') && !s.startsWith(':'))
            .map((s) => s
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()));
        return parts.join(' › ') || 'Page';
    }
    extractComponentName(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const match = content.match(/export\s+default\s+function\s+(\w+)/);
            if (match)
                return match[1];
            const match2 = content.match(/export\s+function\s+(\w+)/);
            if (match2)
                return match2[1];
        }
        catch {
        }
        return null;
    }
};
exports.PageScannerService = PageScannerService;
exports.PageScannerService = PageScannerService = PageScannerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PageScannerService);
//# sourceMappingURL=page-scanner.service.js.map