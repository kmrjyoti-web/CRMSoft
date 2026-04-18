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
var GetDiffViewHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDiffViewHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_diff_view_query_1 = require("./get-diff-view.query");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let GetDiffViewHandler = GetDiffViewHandler_1 = class GetDiffViewHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetDiffViewHandler_1.name);
    }
    async execute(query) {
        try {
            const log = await this.prisma.identity.auditLog.findUnique({
                where: { id: query.id },
                include: { fieldChanges: { orderBy: { createdAt: 'asc' } } },
            });
            if (!log)
                throw new common_1.NotFoundException('Audit log not found');
            const before = log.beforeSnapshot || {};
            const after = log.afterSnapshot || {};
            const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
            const changedFieldNames = new Set(log.fieldChanges.map(fc => fc.fieldName));
            const fields = log.fieldChanges.map(fc => {
                let changeType = 'MODIFIED';
                if (fc.oldValue === null && fc.newValue !== null)
                    changeType = 'ADDED';
                else if (fc.oldValue !== null && fc.newValue === null)
                    changeType = 'REMOVED';
                return {
                    fieldName: fc.fieldName,
                    fieldLabel: fc.fieldLabel,
                    before: { value: fc.oldValue, display: fc.oldDisplayValue || '—' },
                    after: { value: fc.newValue, display: fc.newDisplayValue || '—' },
                    changeType,
                };
            });
            const unchangedFieldCount = allKeys.size - changedFieldNames.size;
            return {
                auditLog: {
                    id: log.id,
                    action: log.action,
                    summary: log.summary,
                    performedByName: log.performedByName,
                    createdAt: log.createdAt.toISOString(),
                },
                diff: {
                    format: 'side_by_side',
                    fields,
                    unchangedFieldCount: Math.max(0, unchangedFieldCount),
                },
            };
        }
        catch (error) {
            this.logger.error(`GetDiffViewHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetDiffViewHandler = GetDiffViewHandler;
exports.GetDiffViewHandler = GetDiffViewHandler = GetDiffViewHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_diff_view_query_1.GetDiffViewQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetDiffViewHandler);
//# sourceMappingURL=get-diff-view.handler.js.map