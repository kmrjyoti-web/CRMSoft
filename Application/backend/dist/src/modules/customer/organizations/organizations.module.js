"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const table_config_module_1 = require("../../softwarevendor/table-config/table-config.module");
const organizations_controller_1 = require("./presentation/organizations.controller");
const organization_repository_1 = require("./infrastructure/repositories/organization.repository");
const organization_repository_interface_1 = require("./domain/interfaces/organization-repository.interface");
const create_organization_handler_1 = require("./application/commands/create-organization/create-organization.handler");
const update_organization_handler_1 = require("./application/commands/update-organization/update-organization.handler");
const deactivate_organization_handler_1 = require("./application/commands/deactivate-organization/deactivate-organization.handler");
const reactivate_organization_handler_1 = require("./application/commands/reactivate-organization/reactivate-organization.handler");
const soft_delete_organization_handler_1 = require("./application/commands/soft-delete-organization/soft-delete-organization.handler");
const restore_organization_handler_1 = require("./application/commands/restore-organization/restore-organization.handler");
const permanent_delete_organization_handler_1 = require("./application/commands/permanent-delete-organization/permanent-delete-organization.handler");
const get_organization_by_id_handler_1 = require("./application/queries/get-organization-by-id/get-organization-by-id.handler");
const get_organizations_list_handler_1 = require("./application/queries/get-organizations-list/get-organizations-list.handler");
const on_organization_created_handler_1 = require("./application/event-handlers/on-organization-created.handler");
const on_organization_deactivated_handler_1 = require("./application/event-handlers/on-organization-deactivated.handler");
const CommandHandlers = [
    create_organization_handler_1.CreateOrganizationHandler, update_organization_handler_1.UpdateOrganizationHandler,
    deactivate_organization_handler_1.DeactivateOrganizationHandler, reactivate_organization_handler_1.ReactivateOrganizationHandler,
    soft_delete_organization_handler_1.SoftDeleteOrganizationHandler, restore_organization_handler_1.RestoreOrganizationHandler, permanent_delete_organization_handler_1.PermanentDeleteOrganizationHandler,
];
const QueryHandlers = [get_organization_by_id_handler_1.GetOrganizationByIdHandler, get_organizations_list_handler_1.GetOrganizationsListHandler];
const EventHandlers = [on_organization_created_handler_1.OnOrganizationCreatedHandler, on_organization_deactivated_handler_1.OnOrganizationDeactivatedHandler];
let OrganizationsModule = class OrganizationsModule {
};
exports.OrganizationsModule = OrganizationsModule;
exports.OrganizationsModule = OrganizationsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule, table_config_module_1.TableConfigModule],
        controllers: [organizations_controller_1.OrganizationsController],
        providers: [
            { provide: organization_repository_interface_1.ORGANIZATION_REPOSITORY, useClass: organization_repository_1.OrganizationRepository },
            ...CommandHandlers,
            ...QueryHandlers,
            ...EventHandlers,
        ],
        exports: [organization_repository_interface_1.ORGANIZATION_REPOSITORY],
    })
], OrganizationsModule);
//# sourceMappingURL=organizations.module.js.map