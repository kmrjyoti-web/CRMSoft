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
var CreateActivityAction_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateActivityAction = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CreateActivityAction = CreateActivityAction_1 = class CreateActivityAction {
    constructor(prisma) {
        this.prisma = prisma;
        this.type = 'CREATE_ACTIVITY';
        this.logger = new common_1.Logger(CreateActivityAction_1.name);
    }
    async execute(config, context) {
        const { type, subject, description } = config;
        if (!type || !subject) {
            return { status: 'FAILED', errorMessage: 'Missing "type" or "subject" in activity config' };
        }
        try {
            const data = {
                type,
                subject,
                description: description || null,
                createdById: context.performer.id,
            };
            if (context.entityType === 'LEAD')
                data.leadId = context.entityId;
            if (context.entityType === 'CONTACT')
                data.contactId = context.entityId;
            const activity = await this.prisma.working.activity.create({ data });
            this.logger.log(`Created activity ${activity.id} for ${context.entityType}/${context.entityId}`);
            return { status: 'SUCCESS', result: { activityId: activity.id } };
        }
        catch (error) {
            return { status: 'FAILED', errorMessage: error instanceof Error ? error.message : String(error) };
        }
    }
};
exports.CreateActivityAction = CreateActivityAction;
exports.CreateActivityAction = CreateActivityAction = CreateActivityAction_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateActivityAction);
//# sourceMappingURL=create-activity.action.js.map