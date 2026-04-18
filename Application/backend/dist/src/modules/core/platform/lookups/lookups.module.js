"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookupsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const lookups_controller_1 = require("./presentation/lookups.controller");
const create_lookup_handler_1 = require("./application/commands/create-lookup/create-lookup.handler");
const update_lookup_handler_1 = require("./application/commands/update-lookup/update-lookup.handler");
const deactivate_lookup_handler_1 = require("./application/commands/deactivate-lookup/deactivate-lookup.handler");
const add_value_handler_1 = require("./application/commands/add-value/add-value.handler");
const update_value_handler_1 = require("./application/commands/update-value/update-value.handler");
const reorder_values_handler_1 = require("./application/commands/reorder-values/reorder-values.handler");
const deactivate_value_handler_1 = require("./application/commands/deactivate-value/deactivate-value.handler");
const reset_lookup_defaults_handler_1 = require("./application/commands/reset-lookup-defaults/reset-lookup-defaults.handler");
const get_all_lookups_handler_1 = require("./application/queries/get-all-lookups/get-all-lookups.handler");
const get_lookup_by_id_handler_1 = require("./application/queries/get-lookup-by-id/get-lookup-by-id.handler");
const get_values_by_category_handler_1 = require("./application/queries/get-values-by-category/get-values-by-category.handler");
const CommandHandlers = [
    create_lookup_handler_1.CreateLookupHandler, update_lookup_handler_1.UpdateLookupHandler, deactivate_lookup_handler_1.DeactivateLookupHandler,
    add_value_handler_1.AddValueHandler, update_value_handler_1.UpdateValueHandler, reorder_values_handler_1.ReorderValuesHandler, deactivate_value_handler_1.DeactivateValueHandler,
    reset_lookup_defaults_handler_1.ResetLookupDefaultsHandler,
];
const QueryHandlers = [
    get_all_lookups_handler_1.GetAllLookupsHandler, get_lookup_by_id_handler_1.GetLookupByIdHandler, get_values_by_category_handler_1.GetValuesByCategoryHandler,
];
let LookupsModule = class LookupsModule {
};
exports.LookupsModule = LookupsModule;
exports.LookupsModule = LookupsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [lookups_controller_1.LookupsController],
        providers: [...CommandHandlers, ...QueryHandlers],
    })
], LookupsModule);
//# sourceMappingURL=lookups.module.js.map