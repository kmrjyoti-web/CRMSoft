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
var TaskLogicService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskLogicService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
let TaskLogicService = TaskLogicService_1 = class TaskLogicService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TaskLogicService_1.name);
    }
    async getConfig(key, tenantId = '') {
        const config = await this.prisma.working.taskLogicConfig.findUnique({
            where: { tenantId_configKey: { tenantId, configKey: key } },
        });
        if (!config || !config.isActive)
            return null;
        return config.value;
    }
    async getAllConfigs(tenantId = '') {
        return this.prisma.working.taskLogicConfig.findMany({
            where: { tenantId, isActive: true },
            orderBy: { configKey: 'asc' },
        });
    }
    async upsertConfig(key, value, description, tenantId = '') {
        return this.prisma.working.taskLogicConfig.upsert({
            where: { tenantId_configKey: { tenantId, configKey: key } },
            update: { value, description, updatedAt: new Date() },
            create: { tenantId, configKey: key, value, description },
        });
    }
    async deleteConfig(key, tenantId = '') {
        return this.prisma.working.taskLogicConfig.update({
            where: { tenantId_configKey: { tenantId, configKey: key } },
            data: { isActive: false },
        });
    }
};
exports.TaskLogicService = TaskLogicService;
exports.TaskLogicService = TaskLogicService = TaskLogicService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaskLogicService);
//# sourceMappingURL=task-logic.service.js.map