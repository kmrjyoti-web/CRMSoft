"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityFiltersModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const entity_filters_controller_1 = require("./presentation/entity-filters.controller");
const assign_filters_handler_1 = require("./application/commands/assign-filters/assign-filters.handler");
const remove_filter_handler_1 = require("./application/commands/remove-filter/remove-filter.handler");
const replace_filters_handler_1 = require("./application/commands/replace-filters/replace-filters.handler");
const copy_filters_handler_1 = require("./application/commands/copy-filters/copy-filters.handler");
const get_entity_filters_handler_1 = require("./application/queries/get-entity-filters/get-entity-filters.handler");
const get_entities_by_filter_handler_1 = require("./application/queries/get-entities-by-filter/get-entities-by-filter.handler");
const CommandHandlers = [
    assign_filters_handler_1.AssignFiltersHandler, remove_filter_handler_1.RemoveFilterHandler, replace_filters_handler_1.ReplaceFiltersHandler, copy_filters_handler_1.CopyFiltersHandler,
];
const QueryHandlers = [get_entity_filters_handler_1.GetEntityFiltersHandler, get_entities_by_filter_handler_1.GetEntitiesByFilterHandler];
let EntityFiltersModule = class EntityFiltersModule {
};
exports.EntityFiltersModule = EntityFiltersModule;
exports.EntityFiltersModule = EntityFiltersModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [entity_filters_controller_1.EntityFiltersController, entity_filters_controller_1.FilterSearchController],
        providers: [...CommandHandlers, ...QueryHandlers],
        exports: [...CommandHandlers, ...QueryHandlers],
    })
], EntityFiltersModule);
//# sourceMappingURL=entity-filters.module.js.map