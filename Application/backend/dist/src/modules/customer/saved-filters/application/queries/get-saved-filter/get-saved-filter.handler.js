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
var GetSavedFilterHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSavedFilterHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_saved_filter_query_1 = require("./get-saved-filter.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetSavedFilterHandler = GetSavedFilterHandler_1 = class GetSavedFilterHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetSavedFilterHandler_1.name);
    }
    async execute(query) {
        try {
            const filter = await this.prisma.working.savedFilter.findFirst({
                where: { id: query.id, isDeleted: false },
            });
            if (!filter)
                throw new common_1.NotFoundException('SavedFilter not found');
            await this.prisma.working.savedFilter.update({
                where: { id: query.id },
                data: { usageCount: { increment: 1 }, lastUsedAt: new Date() },
            });
            return filter;
        }
        catch (error) {
            this.logger.error(`GetSavedFilterHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetSavedFilterHandler = GetSavedFilterHandler;
exports.GetSavedFilterHandler = GetSavedFilterHandler = GetSavedFilterHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_saved_filter_query_1.GetSavedFilterQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetSavedFilterHandler);
//# sourceMappingURL=get-saved-filter.handler.js.map