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
var GetTargetHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTargetHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_target_query_1 = require("./get-target.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetTargetHandler = GetTargetHandler_1 = class GetTargetHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetTargetHandler_1.name);
    }
    async execute(query) {
        try {
            const target = await this.prisma.working.salesTarget.findFirst({
                where: { id: query.id, isDeleted: false },
            });
            if (!target)
                throw new common_1.NotFoundException('Target not found');
            return target;
        }
        catch (error) {
            this.logger.error(`GetTargetHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetTargetHandler = GetTargetHandler;
exports.GetTargetHandler = GetTargetHandler = GetTargetHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_target_query_1.GetTargetQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetTargetHandler);
//# sourceMappingURL=get-target.handler.js.map