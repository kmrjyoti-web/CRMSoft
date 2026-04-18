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
var RejectRequestHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectRequestHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const reject_request_command_1 = require("./reject-request.command");
const maker_checker_engine_1 = require("../../../../../../core/permissions/engines/maker-checker.engine");
const cross_service_decorator_1 = require("../../../../../../common/decorators/cross-service.decorator");
let RejectRequestHandler = RejectRequestHandler_1 = class RejectRequestHandler {
    constructor(makerChecker) {
        this.makerChecker = makerChecker;
        this.logger = new common_1.Logger(RejectRequestHandler_1.name);
    }
    async execute(cmd) {
        try {
            return this.makerChecker.reject(cmd.requestId, cmd.checkerId, cmd.note);
        }
        catch (error) {
            this.logger.error(`RejectRequestHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RejectRequestHandler = RejectRequestHandler;
exports.RejectRequestHandler = RejectRequestHandler = RejectRequestHandler_1 = __decorate([
    (0, cross_service_decorator_1.CrossService)('identity', 'Uses MakerCheckerEngine from core/permissions to validate and record maker-checker decisions'),
    (0, cqrs_1.CommandHandler)(reject_request_command_1.RejectRequestCommand),
    __metadata("design:paramtypes", [maker_checker_engine_1.MakerCheckerEngine])
], RejectRequestHandler);
//# sourceMappingURL=reject-request.handler.js.map