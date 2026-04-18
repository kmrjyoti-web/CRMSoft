"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawContactsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const table_config_module_1 = require("../../softwarevendor/table-config/table-config.module");
const accounts_module_1 = require("../../customer/accounts/accounts.module");
const control_room_module_1 = require("../../softwarevendor/control-room/control-room.module");
const raw_contacts_controller_1 = require("./presentation/raw-contacts.controller");
const raw_contact_repository_1 = require("./infrastructure/repositories/raw-contact.repository");
const raw_contact_repository_interface_1 = require("./domain/interfaces/raw-contact-repository.interface");
const create_raw_contact_handler_1 = require("./application/commands/create-raw-contact/create-raw-contact.handler");
const verify_raw_contact_handler_1 = require("./application/commands/verify-raw-contact/verify-raw-contact.handler");
const reject_raw_contact_handler_1 = require("./application/commands/reject-raw-contact/reject-raw-contact.handler");
const mark_duplicate_handler_1 = require("./application/commands/mark-duplicate/mark-duplicate.handler");
const reopen_raw_contact_handler_1 = require("./application/commands/reopen-raw-contact/reopen-raw-contact.handler");
const update_raw_contact_handler_1 = require("./application/commands/update-raw-contact/update-raw-contact.handler");
const deactivate_raw_contact_handler_1 = require("./application/commands/deactivate-raw-contact/deactivate-raw-contact.handler");
const reactivate_raw_contact_handler_1 = require("./application/commands/reactivate-raw-contact/reactivate-raw-contact.handler");
const soft_delete_raw_contact_handler_1 = require("./application/commands/soft-delete-raw-contact/soft-delete-raw-contact.handler");
const restore_raw_contact_handler_1 = require("./application/commands/restore-raw-contact/restore-raw-contact.handler");
const permanent_delete_raw_contact_handler_1 = require("./application/commands/permanent-delete-raw-contact/permanent-delete-raw-contact.handler");
const get_raw_contact_by_id_handler_1 = require("./application/queries/get-raw-contact-by-id/get-raw-contact-by-id.handler");
const get_raw_contacts_list_handler_1 = require("./application/queries/get-raw-contacts-list/get-raw-contacts-list.handler");
const on_raw_contact_created_handler_1 = require("./application/event-handlers/on-raw-contact-created.handler");
const on_raw_contact_verified_handler_1 = require("./application/event-handlers/on-raw-contact-verified.handler");
const CommandHandlers = [
    create_raw_contact_handler_1.CreateRawContactHandler, verify_raw_contact_handler_1.VerifyRawContactHandler, reject_raw_contact_handler_1.RejectRawContactHandler,
    mark_duplicate_handler_1.MarkDuplicateHandler, reopen_raw_contact_handler_1.ReopenRawContactHandler, update_raw_contact_handler_1.UpdateRawContactHandler,
    deactivate_raw_contact_handler_1.DeactivateRawContactHandler, reactivate_raw_contact_handler_1.ReactivateRawContactHandler,
    soft_delete_raw_contact_handler_1.SoftDeleteRawContactHandler, restore_raw_contact_handler_1.RestoreRawContactHandler, permanent_delete_raw_contact_handler_1.PermanentDeleteRawContactHandler,
];
const QueryHandlers = [get_raw_contact_by_id_handler_1.GetRawContactByIdHandler, get_raw_contacts_list_handler_1.GetRawContactsListHandler];
const EventHandlers = [on_raw_contact_created_handler_1.OnRawContactCreatedHandler, on_raw_contact_verified_handler_1.OnRawContactVerifiedHandler];
let RawContactsModule = class RawContactsModule {
};
exports.RawContactsModule = RawContactsModule;
exports.RawContactsModule = RawContactsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule, table_config_module_1.TableConfigModule, accounts_module_1.AccountsModule, control_room_module_1.ControlRoomModule],
        controllers: [raw_contacts_controller_1.RawContactsController],
        providers: [
            { provide: raw_contact_repository_interface_1.RAW_CONTACT_REPOSITORY, useClass: raw_contact_repository_1.RawContactRepository },
            ...CommandHandlers,
            ...QueryHandlers,
            ...EventHandlers,
        ],
        exports: [raw_contact_repository_interface_1.RAW_CONTACT_REPOSITORY],
    })
], RawContactsModule);
//# sourceMappingURL=raw-contacts.module.js.map