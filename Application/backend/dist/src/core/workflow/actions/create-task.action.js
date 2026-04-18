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
var CreateTaskAction_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTaskAction = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CreateTaskAction = CreateTaskAction_1 = class CreateTaskAction {
    constructor(prisma) {
        this.prisma = prisma;
        this.type = 'CREATE_TASK';
        this.logger = new common_1.Logger(CreateTaskAction_1.name);
    }
    async execute(config, context) {
        const { subject, description, dueDate, assignedToId } = config;
        if (!subject) {
            return { status: 'FAILED', errorMessage: 'Missing "subject" in task config' };
        }
        try {
            const scheduledAt = this.parseDueDate(dueDate);
            const data = {
                type: 'NOTE',
                subject,
                description: description || null,
                scheduledAt,
                createdById: assignedToId || context.performer.id,
            };
            if (context.entityType === 'LEAD')
                data.leadId = context.entityId;
            if (context.entityType === 'CONTACT')
                data.contactId = context.entityId;
            const activity = await this.prisma.working.activity.create({ data });
            this.logger.log(`Created task ${activity.id} due ${scheduledAt.toISOString()}`);
            return { status: 'SUCCESS', result: { taskId: activity.id, dueAt: scheduledAt } };
        }
        catch (error) {
            return { status: 'FAILED', errorMessage: error instanceof Error ? error.message : String(error) };
        }
    }
    parseDueDate(dueDate) {
        if (!dueDate)
            return new Date(Date.now() + 24 * 60 * 60 * 1000);
        const match = dueDate.match(/^\+(\d+)([dhm])$/);
        if (match) {
            const amount = parseInt(match[1], 10);
            const unit = match[2];
            const ms = unit === 'd' ? amount * 86400000 : unit === 'h' ? amount * 3600000 : amount * 60000;
            return new Date(Date.now() + ms);
        }
        return new Date(dueDate);
    }
};
exports.CreateTaskAction = CreateTaskAction;
exports.CreateTaskAction = CreateTaskAction = CreateTaskAction_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateTaskAction);
//# sourceMappingURL=create-task.action.js.map