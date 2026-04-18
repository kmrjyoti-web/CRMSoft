"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const table_config_module_1 = require("../../softwarevendor/table-config/table-config.module");
const workflow_core_module_1 = require("../../../core/workflow/workflow-core.module");
const leads_controller_1 = require("./presentation/leads.controller");
const lead_repository_1 = require("./infrastructure/repositories/lead.repository");
const lead_repository_interface_1 = require("./domain/interfaces/lead-repository.interface");
const create_lead_handler_1 = require("./application/commands/create-lead/create-lead.handler");
const quick_create_lead_handler_1 = require("./application/commands/quick-create-lead/quick-create-lead.handler");
const allocate_lead_handler_1 = require("./application/commands/allocate-lead/allocate-lead.handler");
const change_lead_status_handler_1 = require("./application/commands/change-lead-status/change-lead-status.handler");
const update_lead_handler_1 = require("./application/commands/update-lead/update-lead.handler");
const deactivate_lead_handler_1 = require("./application/commands/deactivate-lead/deactivate-lead.handler");
const reactivate_lead_handler_1 = require("./application/commands/reactivate-lead/reactivate-lead.handler");
const soft_delete_lead_handler_1 = require("./application/commands/soft-delete-lead/soft-delete-lead.handler");
const restore_lead_handler_1 = require("./application/commands/restore-lead/restore-lead.handler");
const permanent_delete_lead_handler_1 = require("./application/commands/permanent-delete-lead/permanent-delete-lead.handler");
const get_lead_by_id_handler_1 = require("./application/queries/get-lead-by-id/get-lead-by-id.handler");
const get_leads_list_handler_1 = require("./application/queries/get-leads-list/get-leads-list.handler");
const on_lead_created_handler_1 = require("./application/event-handlers/on-lead-created.handler");
const on_lead_allocated_handler_1 = require("./application/event-handlers/on-lead-allocated.handler");
const on_lead_status_changed_handler_1 = require("./application/event-handlers/on-lead-status-changed.handler");
const CommandHandlers = [
    create_lead_handler_1.CreateLeadHandler, quick_create_lead_handler_1.QuickCreateLeadHandler, allocate_lead_handler_1.AllocateLeadHandler,
    change_lead_status_handler_1.ChangeLeadStatusHandler, update_lead_handler_1.UpdateLeadHandler,
    deactivate_lead_handler_1.DeactivateLeadHandler, reactivate_lead_handler_1.ReactivateLeadHandler,
    soft_delete_lead_handler_1.SoftDeleteLeadHandler, restore_lead_handler_1.RestoreLeadHandler, permanent_delete_lead_handler_1.PermanentDeleteLeadHandler,
];
const QueryHandlers = [get_lead_by_id_handler_1.GetLeadByIdHandler, get_leads_list_handler_1.GetLeadsListHandler];
const EventHandlers = [on_lead_created_handler_1.OnLeadCreatedHandler, on_lead_allocated_handler_1.OnLeadAllocatedHandler, on_lead_status_changed_handler_1.OnLeadStatusChangedHandler];
let LeadsModule = class LeadsModule {
};
exports.LeadsModule = LeadsModule;
exports.LeadsModule = LeadsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule, table_config_module_1.TableConfigModule, workflow_core_module_1.WorkflowCoreModule],
        controllers: [leads_controller_1.LeadsController],
        providers: [
            { provide: lead_repository_interface_1.LEAD_REPOSITORY, useClass: lead_repository_1.LeadRepository },
            ...CommandHandlers,
            ...QueryHandlers,
            ...EventHandlers,
        ],
        exports: [lead_repository_interface_1.LEAD_REPOSITORY],
    })
], LeadsModule);
//# sourceMappingURL=leads.module.js.map