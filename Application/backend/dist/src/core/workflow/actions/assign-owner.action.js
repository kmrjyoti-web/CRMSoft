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
var AssignOwnerAction_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignOwnerAction = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ALLOWED_TABLES = ['lead', 'contact', 'demo', 'tourPlan', 'quotation', 'activity', 'organization'];
let AssignOwnerAction = AssignOwnerAction_1 = class AssignOwnerAction {
    constructor(prisma) {
        this.prisma = prisma;
        this.type = 'ASSIGN_OWNER';
        this.logger = new common_1.Logger(AssignOwnerAction_1.name);
    }
    async execute(config, context) {
        const { entityTable, ownerField, userId } = config;
        const table = entityTable || this.entityTypeToTable(context.entityType);
        const field = ownerField || 'allocatedToId';
        const targetUserId = userId || context.performer.id;
        if (!ALLOWED_TABLES.includes(table)) {
            return { status: 'FAILED', errorMessage: `Table "${table}" is not in allowed list` };
        }
        try {
            await this.prisma[table].update({
                where: { id: context.entityId },
                data: { [field]: targetUserId },
            });
            this.logger.log(`Assigned ${field}=${targetUserId} on ${table}/${context.entityId}`);
            return { status: 'SUCCESS', result: { table, field, userId: targetUserId } };
        }
        catch (error) {
            return { status: 'FAILED', errorMessage: error instanceof Error ? error.message : String(error) };
        }
    }
    entityTypeToTable(entityType) {
        const map = {
            LEAD: 'lead', CONTACT: 'contact', DEMO: 'demo',
            TOUR_PLAN: 'tourPlan', QUOTATION: 'quotation', ORGANIZATION: 'organization',
        };
        return map[entityType] || entityType.toLowerCase();
    }
};
exports.AssignOwnerAction = AssignOwnerAction;
exports.AssignOwnerAction = AssignOwnerAction = AssignOwnerAction_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssignOwnerAction);
//# sourceMappingURL=assign-owner.action.js.map