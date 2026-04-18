"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurrenceModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const recurrence_controller_1 = require("./presentation/recurrence.controller");
const create_recurrence_handler_1 = require("./application/commands/create-recurrence/create-recurrence.handler");
const update_recurrence_handler_1 = require("./application/commands/update-recurrence/update-recurrence.handler");
const cancel_recurrence_handler_1 = require("./application/commands/cancel-recurrence/cancel-recurrence.handler");
const get_recurrence_list_handler_1 = require("./application/queries/get-recurrence-list/get-recurrence-list.handler");
const get_recurrence_by_id_handler_1 = require("./application/queries/get-recurrence-by-id/get-recurrence-by-id.handler");
const recurrence_generator_service_1 = require("./application/services/recurrence-generator.service");
const CommandHandlers = [create_recurrence_handler_1.CreateRecurrenceHandler, update_recurrence_handler_1.UpdateRecurrenceHandler, cancel_recurrence_handler_1.CancelRecurrenceHandler];
const QueryHandlers = [get_recurrence_list_handler_1.GetRecurrenceListHandler, get_recurrence_by_id_handler_1.GetRecurrenceByIdHandler];
let RecurrenceModule = class RecurrenceModule {
};
exports.RecurrenceModule = RecurrenceModule;
exports.RecurrenceModule = RecurrenceModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [recurrence_controller_1.RecurrenceController],
        providers: [...CommandHandlers, ...QueryHandlers, recurrence_generator_service_1.RecurrenceGeneratorService],
    })
], RecurrenceModule);
//# sourceMappingURL=recurrence.module.js.map