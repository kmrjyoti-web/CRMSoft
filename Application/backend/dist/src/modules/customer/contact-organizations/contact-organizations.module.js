"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactOrganizationsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const contact_organizations_controller_1 = require("./presentation/contact-organizations.controller");
const contact_org_repository_1 = require("./infrastructure/repositories/contact-org.repository");
const contact_org_repository_interface_1 = require("./domain/interfaces/contact-org-repository.interface");
const link_contact_to_org_handler_1 = require("./application/commands/link-contact-to-org/link-contact-to-org.handler");
const unlink_contact_from_org_handler_1 = require("./application/commands/unlink-contact-from-org/unlink-contact-from-org.handler");
const set_primary_contact_handler_1 = require("./application/commands/set-primary-contact/set-primary-contact.handler");
const change_relation_type_handler_1 = require("./application/commands/change-relation-type/change-relation-type.handler");
const update_mapping_handler_1 = require("./application/commands/update-mapping/update-mapping.handler");
const get_by_id_handler_1 = require("./application/queries/get-by-id/get-by-id.handler");
const get_by_contact_handler_1 = require("./application/queries/get-by-contact/get-by-contact.handler");
const get_by_organization_handler_1 = require("./application/queries/get-by-organization/get-by-organization.handler");
const CommandHandlers = [
    link_contact_to_org_handler_1.LinkContactToOrgHandler, unlink_contact_from_org_handler_1.UnlinkContactFromOrgHandler,
    set_primary_contact_handler_1.SetPrimaryContactHandler, change_relation_type_handler_1.ChangeRelationTypeHandler, update_mapping_handler_1.UpdateMappingHandler,
];
const QueryHandlers = [
    get_by_id_handler_1.GetContactOrgByIdHandler, get_by_contact_handler_1.GetOrgsByContactHandler, get_by_organization_handler_1.GetContactsByOrgHandler,
];
let ContactOrganizationsModule = class ContactOrganizationsModule {
};
exports.ContactOrganizationsModule = ContactOrganizationsModule;
exports.ContactOrganizationsModule = ContactOrganizationsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [contact_organizations_controller_1.ContactOrganizationsController],
        providers: [
            { provide: contact_org_repository_interface_1.CONTACT_ORG_REPOSITORY, useClass: contact_org_repository_1.ContactOrgRepository },
            ...CommandHandlers,
            ...QueryHandlers,
        ],
        exports: [contact_org_repository_interface_1.CONTACT_ORG_REPOSITORY],
    })
], ContactOrganizationsModule);
//# sourceMappingURL=contact-organizations.module.js.map