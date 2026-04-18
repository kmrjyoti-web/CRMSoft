"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnershipModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const ownership_core_service_1 = require("./services/ownership-core.service");
const round_robin_service_1 = require("./services/round-robin.service");
const rule_engine_service_1 = require("./services/rule-engine.service");
const workload_service_1 = require("./services/workload.service");
const delegation_service_1 = require("./services/delegation.service");
const ownership_cron_service_1 = require("./services/ownership-cron.service");
const assign_owner_handler_1 = require("./application/commands/assign-owner/assign-owner.handler");
const transfer_owner_handler_1 = require("./application/commands/transfer-owner/transfer-owner.handler");
const revoke_owner_handler_1 = require("./application/commands/revoke-owner/revoke-owner.handler");
const delegate_ownership_handler_1 = require("./application/commands/delegate-ownership/delegate-ownership.handler");
const revert_delegation_handler_1 = require("./application/commands/revert-delegation/revert-delegation.handler");
const bulk_assign_handler_1 = require("./application/commands/bulk-assign/bulk-assign.handler");
const bulk_transfer_handler_1 = require("./application/commands/bulk-transfer/bulk-transfer.handler");
const auto_assign_handler_1 = require("./application/commands/auto-assign/auto-assign.handler");
const create_assignment_rule_handler_1 = require("./application/commands/create-assignment-rule/create-assignment-rule.handler");
const update_assignment_rule_handler_1 = require("./application/commands/update-assignment-rule/update-assignment-rule.handler");
const delete_assignment_rule_handler_1 = require("./application/commands/delete-assignment-rule/delete-assignment-rule.handler");
const update_user_capacity_handler_1 = require("./application/commands/update-user-capacity/update-user-capacity.handler");
const set_user_availability_handler_1 = require("./application/commands/set-user-availability/set-user-availability.handler");
const get_entity_owners_handler_1 = require("./application/queries/get-entity-owners/get-entity-owners.handler");
const get_user_entities_handler_1 = require("./application/queries/get-user-entities/get-user-entities.handler");
const get_ownership_history_handler_1 = require("./application/queries/get-ownership-history/get-ownership-history.handler");
const get_workload_dashboard_handler_1 = require("./application/queries/get-workload-dashboard/get-workload-dashboard.handler");
const get_user_workload_handler_1 = require("./application/queries/get-user-workload/get-user-workload.handler");
const get_assignment_rules_handler_1 = require("./application/queries/get-assignment-rules/get-assignment-rules.handler");
const get_unassigned_entities_handler_1 = require("./application/queries/get-unassigned-entities/get-unassigned-entities.handler");
const get_reassignment_preview_handler_1 = require("./application/queries/get-reassignment-preview/get-reassignment-preview.handler");
const get_delegation_status_handler_1 = require("./application/queries/get-delegation-status/get-delegation-status.handler");
const ownership_controller_1 = require("./presentation/ownership.controller");
const ownership_rules_controller_1 = require("./presentation/ownership-rules.controller");
const ownership_workload_controller_1 = require("./presentation/ownership-workload.controller");
const CommandHandlers = [
    assign_owner_handler_1.AssignOwnerHandler, transfer_owner_handler_1.TransferOwnerHandler, revoke_owner_handler_1.RevokeOwnerHandler,
    delegate_ownership_handler_1.DelegateOwnershipHandler, revert_delegation_handler_1.RevertDelegationHandler,
    bulk_assign_handler_1.BulkAssignHandler, bulk_transfer_handler_1.BulkTransferHandler, auto_assign_handler_1.AutoAssignHandler,
    create_assignment_rule_handler_1.CreateAssignmentRuleHandler, update_assignment_rule_handler_1.UpdateAssignmentRuleHandler, delete_assignment_rule_handler_1.DeleteAssignmentRuleHandler,
    update_user_capacity_handler_1.UpdateUserCapacityHandler, set_user_availability_handler_1.SetUserAvailabilityHandler,
];
const QueryHandlers = [
    get_entity_owners_handler_1.GetEntityOwnersHandler, get_user_entities_handler_1.GetUserEntitiesHandler, get_ownership_history_handler_1.GetOwnershipHistoryHandler,
    get_workload_dashboard_handler_1.GetWorkloadDashboardHandler, get_user_workload_handler_1.GetUserWorkloadHandler, get_assignment_rules_handler_1.GetAssignmentRulesHandler,
    get_unassigned_entities_handler_1.GetUnassignedEntitiesHandler, get_reassignment_preview_handler_1.GetReassignmentPreviewHandler, get_delegation_status_handler_1.GetDelegationStatusHandler,
];
let OwnershipModule = class OwnershipModule {
};
exports.OwnershipModule = OwnershipModule;
exports.OwnershipModule = OwnershipModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [ownership_controller_1.OwnershipController, ownership_rules_controller_1.OwnershipRulesController, ownership_workload_controller_1.OwnershipWorkloadController],
        providers: [
            ownership_core_service_1.OwnershipCoreService, round_robin_service_1.RoundRobinService, rule_engine_service_1.RuleEngineService,
            workload_service_1.WorkloadService, delegation_service_1.DelegationService, ownership_cron_service_1.OwnershipCronService,
            ...CommandHandlers, ...QueryHandlers,
        ],
        exports: [ownership_core_service_1.OwnershipCoreService, rule_engine_service_1.RuleEngineService, workload_service_1.WorkloadService],
    })
], OwnershipModule);
//# sourceMappingURL=ownership.module.js.map