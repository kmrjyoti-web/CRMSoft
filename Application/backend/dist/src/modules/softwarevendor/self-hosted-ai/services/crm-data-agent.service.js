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
var CrmDataAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmDataAgentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let CrmDataAgentService = CrmDataAgentService_1 = class CrmDataAgentService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CrmDataAgentService_1.name);
    }
    async queryLiveData(tenantId, message) {
        const lower = message.toLowerCase();
        if (this.matchesStock(lower))
            return this.queryStock(tenantId);
        if (this.matchesProduct(lower))
            return this.queryProducts(tenantId);
        if (this.matchesInventoryDashboard(lower))
            return this.queryInventoryDashboard(tenantId);
        if (this.matchesContact(lower))
            return this.queryContacts(tenantId);
        if (this.matchesOrganization(lower))
            return this.queryOrganizations(tenantId);
        if (this.matchesLead(lower))
            return this.queryLeads(tenantId);
        if (this.matchesInvoice(lower))
            return this.queryInvoices(tenantId);
        if (this.matchesQuotation(lower))
            return this.queryQuotations(tenantId);
        if (this.matchesActivity(lower))
            return this.queryActivities(tenantId);
        if (this.matchesDashboardSummary(lower))
            return this.queryDashboardSummary(tenantId);
        return null;
    }
    matchesStock(msg) {
        return /\b(stock|inventory|stok|maal|godown|warehouse|available\s*qty|current\s*stock)\b/.test(msg);
    }
    matchesProduct(msg) {
        return /\b(product|products|item|items|saman|catalog|catalogue)\b/.test(msg)
            && !/\b(stock|inventory)\b/.test(msg);
    }
    matchesInventoryDashboard(msg) {
        return /\b(inventory\s*dashboard|stock\s*summary|inventory\s*overview|godown\s*summary)\b/.test(msg);
    }
    matchesContact(msg) {
        return /\b(contact|contacts|customer|customers|client|clients)\b/.test(msg);
    }
    matchesOrganization(msg) {
        return /\b(organization|organisations?|company|companies|firm|firms)\b/.test(msg);
    }
    matchesLead(msg) {
        return /\b(lead|leads|enquir|inquiry|prospect)\b/.test(msg);
    }
    matchesInvoice(msg) {
        return /\b(invoice|invoices|bill|bills|billing)\b/.test(msg);
    }
    matchesQuotation(msg) {
        return /\b(quotation|quotations|quote|quotes|estimate|proforma)\b/.test(msg);
    }
    matchesActivity(msg) {
        return /\b(activit|meeting|call|task|visit|follow.?up)\b/.test(msg);
    }
    matchesDashboardSummary(msg) {
        return /\b(dashboard|summary|overview|total|kitna|how\s*many|count|report)\b/.test(msg);
    }
    async queryStock(tenantId) {
        try {
            const summaries = await this.prisma.stockSummary.findMany({
                where: { tenantId },
                include: { inventoryItem: true },
                orderBy: { currentStock: 'desc' },
                take: 50,
            });
            if (summaries.length === 0) {
                const items = await this.prisma.inventoryItem.findMany({
                    where: { tenantId, isActive: true },
                    orderBy: { currentStock: 'desc' },
                    take: 50,
                });
                if (items.length === 0) {
                    return { intent: 'stock', data: 'No stock data found. No inventory items exist.', recordCount: 0 };
                }
                const productIds = items.map((i) => i.productId);
                const products = await this.prisma.product.findMany({
                    where: { id: { in: productIds }, tenantId },
                    select: { id: true, name: true, code: true },
                });
                const productMap = new Map(products.map((p) => [p.id, p]));
                let data = `INVENTORY STOCK (${items.length} products):\n\n`;
                data += '| # | Product | Code | Current Stock | Type |\n';
                data += '|---|---------|------|---------------|------|\n';
                items.forEach((item, idx) => {
                    const prod = productMap.get(item.productId);
                    data += `| ${idx + 1} | ${prod?.name ?? item.productId} | ${prod?.code ?? '-'} | ${item.currentStock} | ${item.inventoryType} |\n`;
                });
                const totalStock = items.reduce((s, i) => s + i.currentStock, 0);
                data += `\nTOTAL: ${items.length} products, ${totalStock} total units in stock.`;
                return { intent: 'stock', data, recordCount: items.length };
            }
            const productIds = [...new Set(summaries.map((s) => s.productId))];
            const products = await this.prisma.product.findMany({
                where: { id: { in: productIds }, tenantId },
                select: { id: true, name: true, code: true, primaryUnit: true },
            });
            const productMap = new Map(products.map((p) => [p.id, p]));
            let data = `STOCK SUMMARY (${summaries.length} entries):\n\n`;
            data += '| # | Product | Code | Location | Current Stock | Total In | Total Out |\n';
            data += '|---|---------|------|----------|---------------|----------|----------|\n';
            summaries.forEach((s, idx) => {
                const prod = productMap.get(s.productId);
                data += `| ${idx + 1} | ${prod?.name ?? s.productId} | ${prod?.code ?? '-'} | ${s.locationId} | ${s.currentStock} | ${s.totalIn} | ${s.totalOut} |\n`;
            });
            const totalStock = summaries.reduce((s, r) => s + r.currentStock, 0);
            data += `\nTOTAL: ${totalStock} units across ${productIds.length} products.`;
            return { intent: 'stock', data, recordCount: summaries.length };
        }
        catch (e) {
            this.logger.error('Stock query failed', (e instanceof Error ? e.message : String(e)));
            return { intent: 'stock', data: `Error querying stock: ${e.message}`, recordCount: 0 };
        }
    }
    async queryProducts(tenantId) {
        try {
            const products = await this.prisma.product.findMany({
                where: { tenantId, isActive: true },
                select: {
                    id: true, name: true, code: true,
                    mrp: true, salePrice: true, primaryUnit: true, hsnCode: true, status: true,
                },
                orderBy: { name: 'asc' },
                take: 50,
            });
            if (products.length === 0) {
                return { intent: 'products', data: 'No products found in the system.', recordCount: 0 };
            }
            let data = `PRODUCTS (${products.length} items):\n\n`;
            data += '| # | Name | Code | MRP | Sale Price | Unit | HSN | Status |\n';
            data += '|---|------|------|-----|-----------|------|-----|--------|\n';
            products.forEach((p, idx) => {
                data += `| ${idx + 1} | ${p.name} | ${p.code} | ${p.mrp ? Number(p.mrp) : '-'} | ${p.salePrice ? Number(p.salePrice) : '-'} | ${p.primaryUnit} | ${p.hsnCode ?? '-'} | ${p.status} |\n`;
            });
            return { intent: 'products', data, recordCount: products.length };
        }
        catch (e) {
            this.logger.error('Product query failed', (e instanceof Error ? e.message : String(e)));
            return { intent: 'products', data: `Error querying products: ${e.message}`, recordCount: 0 };
        }
    }
    async queryInventoryDashboard(tenantId) {
        try {
            const [totalItems, totalSerials, lowStockItems] = await Promise.all([
                this.prisma.inventoryItem.aggregate({
                    where: { tenantId, isActive: true },
                    _sum: { currentStock: true },
                    _count: true,
                }),
                this.prisma.serialMaster.count({ where: { tenantId } }),
                this.prisma.inventoryItem.findMany({
                    where: { tenantId, isActive: true, reorderLevel: { not: null } },
                }),
            ]);
            const lowStockCount = lowStockItems.filter((i) => i.reorderLevel !== null && i.currentStock <= (i.reorderLevel ?? 0)).length;
            const items = await this.prisma.inventoryItem.findMany({
                where: { tenantId, isActive: true },
            });
            const totalValue = items.reduce((sum, i) => {
                const price = Number(i.avgCostPrice ?? i.lastPurchasePrice ?? 0);
                return sum + price * i.currentStock;
            }, 0);
            const data = `INVENTORY DASHBOARD:
- Total Products in Stock: ${totalItems._count}
- Total Stock Units: ${totalItems._sum.currentStock ?? 0}
- Total Serial Numbers: ${totalSerials}
- Stock Value: ?${totalValue.toLocaleString('en-IN')}
- Low Stock Alerts: ${lowStockCount}`;
            return { intent: 'inventory_dashboard', data, recordCount: totalItems._count };
        }
        catch (e) {
            this.logger.error('Inventory dashboard query failed', (e instanceof Error ? e.message : String(e)));
            return { intent: 'inventory_dashboard', data: `Error: ${e.message}`, recordCount: 0 };
        }
    }
    async queryContacts(tenantId) {
        try {
            const [total, active, verified] = await Promise.all([
                this.prisma.contact.count({ where: { tenantId } }),
                this.prisma.contact.count({ where: { tenantId, isActive: true } }),
                this.prisma.contact.count({ where: { tenantId, entityVerificationStatus: 'VERIFIED' } }),
            ]);
            const recent = await this.prisma.contact.findMany({
                where: { tenantId, isActive: true },
                select: {
                    firstName: true, lastName: true,
                    designation: true, department: true, entityVerificationStatus: true,
                    organization: { select: { name: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 20,
            });
            let data = `CONTACTS SUMMARY:
- Total Contacts: ${total}
- Active: ${active}
- Verified: ${verified}
- Unverified: ${total - verified}

RECENT CONTACTS (latest ${recent.length}):
| # | Name | Designation | Dept | Organization | Verified |
|---|------|-------------|------|--------------|----------|
`;
            recent.forEach((c, idx) => {
                data += `| ${idx + 1} | ${c.firstName} ${c.lastName ?? ''} | ${c.designation ?? '-'} | ${c.department ?? '-'} | ${c.organization?.name ?? '-'} | ${c.entityVerificationStatus === 'VERIFIED' ? 'Yes' : 'No'} |\n`;
            });
            return { intent: 'contacts', data, recordCount: total };
        }
        catch (e) {
            this.logger.error('Contact query failed', (e instanceof Error ? e.message : String(e)));
            return { intent: 'contacts', data: `Error: ${e.message}`, recordCount: 0 };
        }
    }
    async queryOrganizations(tenantId) {
        try {
            const [total, verified] = await Promise.all([
                this.prisma.organization.count({ where: { tenantId } }),
                this.prisma.organization.count({ where: { tenantId, entityVerificationStatus: 'VERIFIED' } }),
            ]);
            const orgs = await this.prisma.organization.findMany({
                where: { tenantId, isActive: true },
                select: {
                    name: true, industry: true, city: true, state: true,
                    entityVerificationStatus: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 20,
            });
            let data = `ORGANIZATIONS SUMMARY:
- Total: ${total}
- Verified: ${verified}

RECENT ORGANIZATIONS (latest ${orgs.length}):
| # | Name | Industry | City | State | Verified |
|---|------|----------|------|-------|----------|
`;
            orgs.forEach((o, idx) => {
                data += `| ${idx + 1} | ${o.name} | ${o.industry ?? '-'} | ${o.city ?? '-'} | ${o.state ?? '-'} | ${o.entityVerificationStatus === 'VERIFIED' ? 'Yes' : 'No'} |\n`;
            });
            return { intent: 'organizations', data, recordCount: total };
        }
        catch (e) {
            this.logger.error('Organization query failed', (e instanceof Error ? e.message : String(e)));
            return { intent: 'organizations', data: `Error: ${e.message}`, recordCount: 0 };
        }
    }
    async queryLeads(tenantId) {
        try {
            const leads = await this.prisma.lead.findMany({
                where: { tenantId },
                select: {
                    leadNumber: true, status: true, priority: true,
                    expectedValue: true, allocatedTo: { select: { firstName: true, lastName: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 20,
            });
            const total = await this.prisma.lead.count({ where: { tenantId } });
            const statusGroups = await this.prisma.lead.groupBy({
                by: ['status'],
                where: { tenantId },
                _count: true,
            });
            const statusSummary = statusGroups.map((g) => `${g.status}: ${g._count}`).join(', ');
            let data = `LEADS SUMMARY:
- Total: ${total}
- By Status: ${statusSummary}

RECENT LEADS (latest ${leads.length}):
| # | Lead # | Status | Priority | Est. Value | Allocated To |
|---|--------|--------|----------|-----------|--------------|
`;
            leads.forEach((l, idx) => {
                data += `| ${idx + 1} | ${l.leadNumber} | ${l.status} | ${l.priority} | ${l.expectedValue ? Number(l.expectedValue) : '-'} | ${l.allocatedTo ? `${l.allocatedTo.firstName} ${l.allocatedTo.lastName}` : '-'} |\n`;
            });
            return { intent: 'leads', data, recordCount: total };
        }
        catch (e) {
            this.logger.error('Lead query failed', (e instanceof Error ? e.message : String(e)));
            return { intent: 'leads', data: `Error: ${e.message}`, recordCount: 0 };
        }
    }
    async queryInvoices(tenantId) {
        try {
            const invoices = await this.prisma.invoice.findMany({
                where: { tenantId },
                select: {
                    invoiceNo: true, status: true, totalAmount: true,
                    invoiceDate: true, dueDate: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 20,
            });
            const total = await this.prisma.invoice.count({ where: { tenantId } });
            let data = `INVOICES (Total: ${total}, showing latest ${invoices.length}):\n\n`;
            data += '| # | Invoice # | Status | Amount | Date | Due Date |\n';
            data += '|---|-----------|--------|--------|------|----------|\n';
            invoices.forEach((inv, idx) => {
                data += `| ${idx + 1} | ${inv.invoiceNo} | ${inv.status} | ?${Number(inv.totalAmount ?? 0).toLocaleString('en-IN')} | ${inv.invoiceDate?.toISOString().split('T')[0] ?? '-'} | ${inv.dueDate?.toISOString().split('T')[0] ?? '-'} |\n`;
            });
            return { intent: 'invoices', data, recordCount: total };
        }
        catch (e) {
            this.logger.error('Invoice query failed', (e instanceof Error ? e.message : String(e)));
            return { intent: 'invoices', data: `Error: ${e.message}`, recordCount: 0 };
        }
    }
    async queryQuotations(tenantId) {
        try {
            const quotes = await this.prisma.quotation.findMany({
                where: { tenantId },
                select: {
                    quotationNo: true, status: true, totalAmount: true,
                    validUntil: true, createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 20,
            });
            const total = await this.prisma.quotation.count({ where: { tenantId } });
            let data = `QUOTATIONS (Total: ${total}, showing latest ${quotes.length}):\n\n`;
            data += '| # | Quotation # | Status | Amount | Valid Until |\n';
            data += '|---|-------------|--------|--------|-------------|\n';
            quotes.forEach((q, idx) => {
                data += `| ${idx + 1} | ${q.quotationNo} | ${q.status} | ?${Number(q.totalAmount ?? 0).toLocaleString('en-IN')} | ${q.validUntil?.toISOString().split('T')[0] ?? '-'} |\n`;
            });
            return { intent: 'quotations', data, recordCount: total };
        }
        catch (e) {
            this.logger.error('Quotation query failed', (e instanceof Error ? e.message : String(e)));
            return { intent: 'quotations', data: `Error: ${e.message}`, recordCount: 0 };
        }
    }
    async queryActivities(tenantId) {
        try {
            const activities = await this.prisma.activity.findMany({
                where: { tenantId },
                select: {
                    type: true, subject: true,
                    scheduledAt: true, completedAt: true,
                    createdByUser: { select: { firstName: true, lastName: true } },
                },
                orderBy: { scheduledAt: 'desc' },
                take: 20,
            });
            const total = await this.prisma.activity.count({ where: { tenantId } });
            let data = `ACTIVITIES (Total: ${total}, showing latest ${activities.length}):\n\n`;
            data += '| # | Type | Subject | Scheduled | Completed | Created By |\n';
            data += '|---|------|---------|-----------|-----------|------------|\n';
            activities.forEach((a, idx) => {
                data += `| ${idx + 1} | ${a.type} | ${a.subject ?? '-'} | ${a.scheduledAt?.toISOString().split('T')[0] ?? '-'} | ${a.completedAt?.toISOString().split('T')[0] ?? '-'} | ${a.createdByUser ? `${a.createdByUser.firstName} ${a.createdByUser.lastName}` : '-'} |\n`;
            });
            return { intent: 'activities', data, recordCount: total };
        }
        catch (e) {
            this.logger.error('Activity query failed', (e instanceof Error ? e.message : String(e)));
            return { intent: 'activities', data: `Error: ${e.message}`, recordCount: 0 };
        }
    }
    async queryDashboardSummary(tenantId) {
        try {
            const [contacts, orgs, leads, products, invoices] = await Promise.all([
                this.prisma.contact.count({ where: { tenantId } }),
                this.prisma.organization.count({ where: { tenantId } }),
                this.prisma.lead.count({ where: { tenantId } }),
                this.prisma.product.count({ where: { tenantId, isActive: true } }),
                this.prisma.invoice.count({ where: { tenantId } }),
            ]);
            const data = `CRM DASHBOARD SUMMARY:
- Total Contacts: ${contacts}
- Total Organizations: ${orgs}
- Total Leads: ${leads}
- Total Products: ${products}
- Total Invoices: ${invoices}`;
            return { intent: 'dashboard', data, recordCount: contacts + orgs + leads + products + invoices };
        }
        catch (e) {
            this.logger.error('Dashboard query failed', (e instanceof Error ? e.message : String(e)));
            return { intent: 'dashboard', data: `Error: ${e.message}`, recordCount: 0 };
        }
    }
};
exports.CrmDataAgentService = CrmDataAgentService;
exports.CrmDataAgentService = CrmDataAgentService = CrmDataAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CrmDataAgentService);
//# sourceMappingURL=crm-data-agent.service.js.map