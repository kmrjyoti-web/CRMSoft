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
var ApproveRequestHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveRequestHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const approve_request_command_1 = require("./approve-request.command");
const maker_checker_engine_1 = require("../../../../../../core/permissions/engines/maker-checker.engine");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const cross_service_decorator_1 = require("../../../../../../common/decorators/cross-service.decorator");
let ApproveRequestHandler = ApproveRequestHandler_1 = class ApproveRequestHandler {
    constructor(makerChecker, prisma) {
        this.makerChecker = makerChecker;
        this.prisma = prisma;
        this.logger = new common_1.Logger(ApproveRequestHandler_1.name);
    }
    async execute(cmd) {
        try {
            const request = await this.prisma.working.approvalRequest.findUnique({
                where: { id: cmd.requestId },
            });
            if (request && request.checkerRole !== cmd.checkerRole) {
                throw new common_1.ForbiddenException(`This request requires role "${request.checkerRole}" to approve`);
            }
            return this.makerChecker.approve(cmd.requestId, cmd.checkerId, cmd.note);
        }
        catch (error) {
            this.logger.error(`ApproveRequestHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ApproveRequestHandler = ApproveRequestHandler;
exports.ApproveRequestHandler = ApproveRequestHandler = ApproveRequestHandler_1 = __decorate([
    (0, cross_service_decorator_1.CrossService)('identity', 'Uses MakerCheckerEngine from core/permissions to validate and record the checker approval decision'),
    (0, cqrs_1.CommandHandler)(approve_request_command_1.ApproveRequestCommand),
    __metadata("design:paramtypes", [maker_checker_engine_1.MakerCheckerEngine,
        prisma_service_1.PrismaService])
], ApproveRequestHandler);
//# sourceMappingURL=approve-request.handler.js.map