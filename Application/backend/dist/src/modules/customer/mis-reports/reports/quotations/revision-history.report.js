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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevisionHistoryReport = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const drill_down_service_1 = require("../../infrastructure/drill-down.service");
let RevisionHistoryReport = class RevisionHistoryReport {
    constructor(prisma, drillDownSvc) {
        this.prisma = prisma;
        this.drillDownSvc = drillDownSvc;
        this.code = 'REVISION_HISTORY';
        this.name = 'Revision History Analysis';
        this.category = 'QUOTATION';
        this.description = 'Analyses quotation revision patterns, discount progression, and outcome correlation with revision counts';
        this.supportsDrillDown = false;
        this.supportsPeriodComparison = false;
        this.availableFilters = [
            { key: 'createdById', label: 'Created By', type: 'user' },
            { key: 'minRevisions', label: 'Min Revisions', type: 'text' },
        ];
    }
    async generate(params) {
        const where = {
            tenantId: params.tenantId,
            createdAt: { gte: params.dateFrom, lte: params.dateTo },
            parentQuotationId: null,
        };
        if (params.userId)
            where.createdById = params.userId;
        const originals = await this.prisma.working.quotation.findMany({
            where,
            include: {
                revisions: {
                    orderBy: { version: 'desc' },
                    select: { id: true, version: true, totalAmount: true, status: true },
                },
                lead: { select: { organization: { select: { name: true } } } },
                createdByUser: { select: { firstName: true, lastName: true } },
            },
        });
        const withRevisions = originals.filter(q => q.revisions.length > 0);
        const chains = withRevisions.map(q => {
            const allVersions = [
                { version: q.version, totalAmount: Number(q.totalAmount), status: q.status },
                ...q.revisions.map(r => ({ version: r.version, totalAmount: Number(r.totalAmount), status: r.status })),
            ].sort((a, b) => a.version - b.version);
            const originalValue = allVersions[0].totalAmount;
            const latest = allVersions[allVersions.length - 1];
            const finalValue = latest.totalAmount;
            const revisionCount = q.revisions.length;
            const totalDiscount = originalValue - finalValue;
            const discountPct = originalValue > 0
                ? Math.round((totalDiscount / originalValue) * 10000) / 100 : 0;
            return {
                quotationNo: q.quotationNo,
                organization: q.lead?.organization?.name || '',
                createdBy: q.createdByUser ? `${q.createdByUser.firstName} ${q.createdByUser.lastName}` : '',
                originalValue, finalValue, revisionCount,
                totalDiscountGiven: Math.max(0, totalDiscount),
                discountPercent: Math.max(0, discountPct),
                outcome: latest.status,
            };
        });
        const totalWithRevisions = chains.length;
        const allRevCounts = chains.map(c => c.revisionCount);
        const avgRevisions = totalWithRevisions > 0
            ? Math.round(allRevCounts.reduce((a, b) => a + b, 0) / totalWithRevisions * 100) / 100 : 0;
        const singleRevision = chains.filter(c => c.revisionCount === 1).length;
        const multipleRevisions = chains.filter(c => c.revisionCount > 1).length;
        const maxChain = chains.reduce((max, c) => c.revisionCount > (max?.revisionCount || 0) ? c : max, chains[0]);
        const maxRevisionsLabel = maxChain
            ? `${maxChain.quotationNo} (${maxChain.revisionCount} revisions, ${maxChain.outcome})`
            : 'N/A';
        const revisedOriginals = originals.filter(q => q.revisions.length > 0);
        let totalDaysPerRevision = 0;
        let dprCount = 0;
        for (const q of revisedOriginals) {
            const latestRevision = q.revisions[0];
            if (latestRevision && q.revisions.length > 0) {
                dprCount++;
            }
        }
        const avgDaysPerRevision = dprCount > 0 ? Math.round(totalDaysPerRevision / dprCount) : 0;
        const summary = [
            { key: 'totalWithRevisions', label: 'Quotations with Revisions', value: totalWithRevisions, format: 'number' },
            { key: 'avgRevisions', label: 'Avg Revisions', value: avgRevisions, format: 'number' },
            { key: 'singleRevision', label: 'Single Revision', value: singleRevision, format: 'number' },
            { key: 'multipleRevisions', label: 'Multiple Revisions', value: multipleRevisions, format: 'number' },
            { key: 'maxRevisions', label: 'Max Revisions', value: maxChain?.revisionCount || 0, format: 'number' },
            { key: 'avgDaysPerRevision', label: 'Avg Days per Revision', value: avgDaysPerRevision, format: 'days' },
        ];
        const bucketLabels = ['0 revisions', '1 revision', '2 revisions', '3+ revisions'];
        const noRevisionOriginals = originals.filter(q => q.revisions.length === 0);
        const bucketData = [
            { accepted: noRevisionOriginals.filter(q => q.status === 'ACCEPTED').length, total: noRevisionOriginals.filter(q => ['ACCEPTED', 'REJECTED'].includes(q.status)).length },
            { accepted: chains.filter(c => c.revisionCount === 1 && c.outcome === 'ACCEPTED').length, total: chains.filter(c => c.revisionCount === 1 && ['ACCEPTED', 'REJECTED'].includes(c.outcome)).length },
            { accepted: chains.filter(c => c.revisionCount === 2 && c.outcome === 'ACCEPTED').length, total: chains.filter(c => c.revisionCount === 2 && ['ACCEPTED', 'REJECTED'].includes(c.outcome)).length },
            { accepted: chains.filter(c => c.revisionCount >= 3 && c.outcome === 'ACCEPTED').length, total: chains.filter(c => c.revisionCount >= 3 && ['ACCEPTED', 'REJECTED'].includes(c.outcome)).length },
        ];
        const acceptanceByRevisions = {
            type: 'BAR', title: 'Acceptance Rate by Revision Count',
            labels: bucketLabels,
            datasets: [{
                    label: 'Acceptance Rate %',
                    data: bucketData.map(b => b.total > 0 ? Math.round((b.accepted / b.total) * 10000) / 100 : 0),
                    color: '#4CAF50',
                }],
        };
        const tableRows = [...chains].sort((a, b) => b.revisionCount - a.revisionCount);
        const tableCols = [
            { key: 'quotationNo', header: 'Quotation #', width: 16 },
            { key: 'organization', header: 'Organization', width: 22 },
            { key: 'originalValue', header: 'Original Value', width: 14, format: 'currency' },
            { key: 'finalValue', header: 'Final Value', width: 14, format: 'currency' },
            { key: 'revisionCount', header: 'Revisions', width: 10, format: 'number' },
            { key: 'totalDiscountGiven', header: 'Discount Given', width: 14, format: 'currency' },
            { key: 'discountPercent', header: 'Discount %', width: 10, format: 'percent' },
            { key: 'outcome', header: 'Outcome', width: 14 },
        ];
        const acceptedChains = chains.filter(c => c.outcome === 'ACCEPTED');
        const avgDiscountAccepted = acceptedChains.length > 0
            ? Math.round(acceptedChains.reduce((s, c) => s + c.discountPercent, 0) / acceptedChains.length * 100) / 100 : 0;
        const insight = totalWithRevisions > 0
            ? `${totalWithRevisions} quotations underwent revisions (avg ${avgRevisions}). ` +
                `Accepted deals averaged ${avgDiscountAccepted}% discount across revisions. ` +
                `Most revised: ${maxRevisionsLabel}.`
            : 'No quotations with revisions found in the selected period.';
        return {
            reportCode: this.code, reportName: this.name, category: this.category,
            generatedAt: new Date(), params, summary,
            charts: [acceptanceByRevisions],
            tables: [{ title: 'Revision Chain Details', columns: tableCols, rows: tableRows }],
            metadata: { insight, maxRevisionsDetail: maxRevisionsLabel },
        };
    }
};
exports.RevisionHistoryReport = RevisionHistoryReport;
exports.RevisionHistoryReport = RevisionHistoryReport = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        drill_down_service_1.DrillDownService])
], RevisionHistoryReport);
//# sourceMappingURL=revision-history.report.js.map