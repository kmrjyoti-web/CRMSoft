"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedFiltersModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const saved_filters_controller_1 = require("./presentation/saved-filters.controller");
const create_saved_filter_handler_1 = require("./application/commands/create-saved-filter/create-saved-filter.handler");
const update_saved_filter_handler_1 = require("./application/commands/update-saved-filter/update-saved-filter.handler");
const delete_saved_filter_handler_1 = require("./application/commands/delete-saved-filter/delete-saved-filter.handler");
const list_saved_filters_handler_1 = require("./application/queries/list-saved-filters/list-saved-filters.handler");
const get_saved_filter_handler_1 = require("./application/queries/get-saved-filter/get-saved-filter.handler");
const CommandHandlers = [create_saved_filter_handler_1.CreateSavedFilterHandler, update_saved_filter_handler_1.UpdateSavedFilterHandler, delete_saved_filter_handler_1.DeleteSavedFilterHandler];
const QueryHandlers = [list_saved_filters_handler_1.ListSavedFiltersHandler, get_saved_filter_handler_1.GetSavedFilterHandler];
let SavedFiltersModule = class SavedFiltersModule {
};
exports.SavedFiltersModule = SavedFiltersModule;
exports.SavedFiltersModule = SavedFiltersModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [saved_filters_controller_1.SavedFiltersController],
        providers: [...CommandHandlers, ...QueryHandlers],
    })
], SavedFiltersModule);
//# sourceMappingURL=saved-filters.module.js.map