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
var GetInstanceTransitionsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInstanceTransitionsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const workflow_engine_service_1 = require("../../../../../../core/workflow/workflow-engine.service");
const get_instance_transitions_query_1 = require("./get-instance-transitions.query");
const cross_service_decorator_1 = require("../../../../../../common/decorators/cross-service.decorator");
let GetInstanceTransitionsHandler = GetInstanceTransitionsHandler_1 = class GetInstanceTransitionsHandler {
    constructor(engine) {
        this.engine = engine;
        this.logger = new common_1.Logger(GetInstanceTransitionsHandler_1.name);
    }
    async execute(query) {
        try {
            return this.engine.getAvailableTransitions(query.instanceId, query.userId);
        }
        catch (error) {
            this.logger.error(`GetInstanceTransitionsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetInstanceTransitionsHandler = GetInstanceTransitionsHandler;
exports.GetInstanceTransitionsHandler = GetInstanceTransitionsHandler = GetInstanceTransitionsHandler_1 = __decorate([
    (0, cross_service_decorator_1.CrossService)('work', 'Uses WorkflowEngineService from core/workflow (Work service) to execute tenant workflow state transitions'),
    (0, cqrs_1.QueryHandler)(get_instance_transitions_query_1.GetInstanceTransitionsQuery),
    __metadata("design:paramtypes", [workflow_engine_service_1.WorkflowEngineService])
], GetInstanceTransitionsHandler);
//# sourceMappingURL=get-instance-transitions.handler.js.map