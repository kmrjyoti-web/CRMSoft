"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const table_config_module_1 = require("../../softwarevendor/table-config/table-config.module");
const contacts_controller_1 = require("./presentation/contacts.controller");
const contact_repository_1 = require("./infrastructure/repositories/contact.repository");
const contact_repository_interface_1 = require("./domain/interfaces/contact-repository.interface");
const create_contact_handler_1 = require("./application/commands/create-contact/create-contact.handler");
const update_contact_handler_1 = require("./application/commands/update-contact/update-contact.handler");
const deactivate_contact_handler_1 = require("./application/commands/deactivate-contact/deactivate-contact.handler");
const reactivate_contact_handler_1 = require("./application/commands/reactivate-contact/reactivate-contact.handler");
const soft_delete_contact_handler_1 = require("./application/commands/soft-delete-contact/soft-delete-contact.handler");
const restore_contact_handler_1 = require("./application/commands/restore-contact/restore-contact.handler");
const permanent_delete_contact_handler_1 = require("./application/commands/permanent-delete-contact/permanent-delete-contact.handler");
const get_contact_by_id_handler_1 = require("./application/queries/get-contact-by-id/get-contact-by-id.handler");
const get_contacts_list_handler_1 = require("./application/queries/get-contacts-list/get-contacts-list.handler");
const get_contacts_dashboard_handler_1 = require("./application/queries/get-contacts-dashboard/get-contacts-dashboard.handler");
const on_contact_created_handler_1 = require("./application/event-handlers/on-contact-created.handler");
const on_contact_deactivated_handler_1 = require("./application/event-handlers/on-contact-deactivated.handler");
const CommandHandlers = [
    create_contact_handler_1.CreateContactHandler, update_contact_handler_1.UpdateContactHandler,
    deactivate_contact_handler_1.DeactivateContactHandler, reactivate_contact_handler_1.ReactivateContactHandler,
    soft_delete_contact_handler_1.SoftDeleteContactHandler, restore_contact_handler_1.RestoreContactHandler, permanent_delete_contact_handler_1.PermanentDeleteContactHandler,
];
const QueryHandlers = [get_contact_by_id_handler_1.GetContactByIdHandler, get_contacts_list_handler_1.GetContactsListHandler, get_contacts_dashboard_handler_1.GetContactsDashboardHandler];
const EventHandlers = [on_contact_created_handler_1.OnContactCreatedHandler, on_contact_deactivated_handler_1.OnContactDeactivatedHandler];
let ContactsModule = class ContactsModule {
};
exports.ContactsModule = ContactsModule;
exports.ContactsModule = ContactsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule, table_config_module_1.TableConfigModule],
        controllers: [contacts_controller_1.ContactsController],
        providers: [
            { provide: contact_repository_interface_1.CONTACT_REPOSITORY, useClass: contact_repository_1.ContactRepository },
            ...CommandHandlers,
            ...QueryHandlers,
            ...EventHandlers,
        ],
        exports: [contact_repository_interface_1.CONTACT_REPOSITORY],
    })
], ContactsModule);
//# sourceMappingURL=contacts.module.js.map