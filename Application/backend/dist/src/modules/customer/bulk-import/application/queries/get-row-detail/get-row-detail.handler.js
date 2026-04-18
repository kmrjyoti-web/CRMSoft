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
var GetRowDetailHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRowDetailHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_row_detail_query_1 = require("./get-row-detail.query");
let GetRowDetailHandler = GetRowDetailHandler_1 = class GetRowDetailHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetRowDetailHandler_1.name);
    }
    async execute(query) {
        try {
            return this.prisma.working.importRow.findUniqueOrThrow({
                where: { id: query.rowId },
            });
        }
        catch (error) {
            this.logger.error(`GetRowDetailHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetRowDetailHandler = GetRowDetailHandler;
exports.GetRowDetailHandler = GetRowDetailHandler = GetRowDetailHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_row_detail_query_1.GetRowDetailQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetRowDetailHandler);
//# sourceMappingURL=get-row-detail.handler.js.map