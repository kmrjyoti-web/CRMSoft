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
var RejectTransitionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectTransitionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const workflow_engine_service_1 = require("../../../../../../core/workflow/workflow-engine.service");
const reject_transition_command_1 = require("./reject-transition.command");
const cross_service_decorator_1 = require("../../../../../../common/decorators/cross-service.decorator");
let RejectTransitionHandler = RejectTransitionHandler_1 = class RejectTransitionHandler {
    constructor(engine) {
        this.engine = engine;
        this.logger = new common_1.Logger(RejectTransitionHandler_1.name);
    }
    async execute(cmd) {
        try {
            return this.engine.rejectTransition(cmd.approvalId, cmd.userId, cmd.comment);
        }
        catch (error) {
            this.logger.error(`RejectTransitionHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RejectTransitionHandler = RejectTransitionHandler;
exports.RejectTransitionHandler = RejectTransitionHandler = RejectTransitionHandler_1 = __decorate([
    (0, cross_service_decorator_1.CrossService)('work', 'Uses WorkflowEngineService from core/workflow (Work service) to execute tenant workflow state transitions'),
    (0, cqrs_1.CommandHandler)(reject_transition_command_1.RejectTransitionCommand),
    __metadata("design:paramtypes", [workflow_engine_service_1.WorkflowEngineService])
], RejectTransitionHandler);
//# sourceMappingURL=reject-transition.handler.js.map