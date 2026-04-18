"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowCoreModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const workflow_engine_service_1 = require("./workflow-engine.service");
const condition_evaluator_service_1 = require("./condition-evaluator.service");
const action_executor_service_1 = require("./action-executor.service");
const template_resolver_service_1 = require("./template-resolver.service");
const sla_monitor_service_1 = require("./sla-monitor.service");
const field_update_action_1 = require("./actions/field-update.action");
const send_email_action_1 = require("./actions/send-email.action");
const send_notification_action_1 = require("./actions/send-notification.action");
const create_activity_action_1 = require("./actions/create-activity.action");
const create_task_action_1 = require("./actions/create-task.action");
const webhook_action_1 = require("./actions/webhook.action");
const assign_owner_action_1 = require("./actions/assign-owner.action");
const ActionHandlers = [
    field_update_action_1.FieldUpdateAction,
    send_email_action_1.SendEmailAction,
    send_notification_action_1.SendNotificationAction,
    create_activity_action_1.CreateActivityAction,
    create_task_action_1.CreateTaskAction,
    webhook_action_1.WebhookAction,
    assign_owner_action_1.AssignOwnerAction,
];
const Services = [
    workflow_engine_service_1.WorkflowEngineService,
    condition_evaluator_service_1.ConditionEvaluatorService,
    action_executor_service_1.ActionExecutorService,
    template_resolver_service_1.TemplateResolverService,
    sla_monitor_service_1.SlaMonitorService,
];
let WorkflowCoreModule = class WorkflowCoreModule {
};
exports.WorkflowCoreModule = WorkflowCoreModule;
exports.WorkflowCoreModule = WorkflowCoreModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot()],
        providers: [...Services, ...ActionHandlers],
        exports: [workflow_engine_service_1.WorkflowEngineService, condition_evaluator_service_1.ConditionEvaluatorService],
    })
], WorkflowCoreModule);
//# sourceMappingURL=workflow-core.module.js.map