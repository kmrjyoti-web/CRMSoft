"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const communications_controller_1 = require("./presentation/communications.controller");
const communication_repository_1 = require("./infrastructure/repositories/communication.repository");
const communication_repository_interface_1 = require("./domain/interfaces/communication-repository.interface");
const add_communication_handler_1 = require("./application/commands/add-communication/add-communication.handler");
const update_communication_handler_1 = require("./application/commands/update-communication/update-communication.handler");
const delete_communication_handler_1 = require("./application/commands/delete-communication/delete-communication.handler");
const set_primary_handler_1 = require("./application/commands/set-primary/set-primary.handler");
const mark_verified_handler_1 = require("./application/commands/mark-verified/mark-verified.handler");
const link_to_entity_handler_1 = require("./application/commands/link-to-entity/link-to-entity.handler");
const get_communication_by_id_handler_1 = require("./application/queries/get-communication-by-id/get-communication-by-id.handler");
const get_communications_by_entity_handler_1 = require("./application/queries/get-communications-by-entity/get-communications-by-entity.handler");
const CommandHandlers = [
    add_communication_handler_1.AddCommunicationHandler, update_communication_handler_1.UpdateCommunicationHandler, delete_communication_handler_1.DeleteCommunicationHandler,
    set_primary_handler_1.SetPrimaryHandler, mark_verified_handler_1.MarkVerifiedHandler, link_to_entity_handler_1.LinkToEntityHandler,
];
const QueryHandlers = [get_communication_by_id_handler_1.GetCommunicationByIdHandler, get_communications_by_entity_handler_1.GetCommunicationsByEntityHandler];
let CommunicationsModule = class CommunicationsModule {
};
exports.CommunicationsModule = CommunicationsModule;
exports.CommunicationsModule = CommunicationsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [communications_controller_1.CommunicationsController],
        providers: [
            { provide: communication_repository_interface_1.COMMUNICATION_REPOSITORY, useClass: communication_repository_1.CommunicationRepository },
            ...CommandHandlers,
            ...QueryHandlers,
        ],
        exports: [communication_repository_interface_1.COMMUNICATION_REPOSITORY],
    })
], CommunicationsModule);
//# sourceMappingURL=communications.module.js.map