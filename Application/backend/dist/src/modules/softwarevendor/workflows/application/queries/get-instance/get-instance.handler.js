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
var GetInstanceHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInstanceHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_instance_query_1 = require("./get-instance.query");
let GetInstanceHandler = GetInstanceHandler_1 = class GetInstanceHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetInstanceHandler_1.name);
    }
    async execute(query) {
        try {
            const instance = await this.prisma.workflowInstance.findUnique({
                where: { id: query.instanceId },
                include: {
                    workflow: { select: { id: true, name: true, code: true, entityType: true } },
                    currentState: true,
                    previousState: true,
                    _count: { select: { history: true, approvals: true } },
                },
            });
            if (!instance)
                throw new common_1.NotFoundException(`Instance "${query.instanceId}" not found`);
            return instance;
        }
        catch (error) {
            this.logger.error(`GetInstanceHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetInstanceHandler = GetInstanceHandler;
exports.GetInstanceHandler = GetInstanceHandler = GetInstanceHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_instance_query_1.GetInstanceQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetInstanceHandler);
//# sourceMappingURL=get-instance.handler.js.map