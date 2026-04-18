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
var GetDemoByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDemoByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_demo_by_id_query_1 = require("./get-demo-by-id.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetDemoByIdHandler = GetDemoByIdHandler_1 = class GetDemoByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetDemoByIdHandler_1.name);
    }
    async execute(query) {
        try {
            const demo = await this.prisma.working.demo.findUnique({
                where: { id: query.id },
                include: {
                    lead: { select: { id: true, leadNumber: true, status: true } },
                    conductedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
            });
            if (!demo)
                throw new common_1.NotFoundException('Demo not found');
            return demo;
        }
        catch (error) {
            this.logger.error(`GetDemoByIdHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetDemoByIdHandler = GetDemoByIdHandler;
exports.GetDemoByIdHandler = GetDemoByIdHandler = GetDemoByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_demo_by_id_query_1.GetDemoByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetDemoByIdHandler);
//# sourceMappingURL=get-demo-by-id.handler.js.map