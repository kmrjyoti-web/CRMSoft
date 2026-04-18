"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomFieldsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const custom_fields_controller_1 = require("./presentation/custom-fields.controller");
const create_field_definition_handler_1 = require("./application/commands/create-field-definition/create-field-definition.handler");
const update_field_definition_handler_1 = require("./application/commands/update-field-definition/update-field-definition.handler");
const delete_field_definition_handler_1 = require("./application/commands/delete-field-definition/delete-field-definition.handler");
const set_field_value_handler_1 = require("./application/commands/set-field-value/set-field-value.handler");
const get_field_definitions_handler_1 = require("./application/queries/get-field-definitions/get-field-definitions.handler");
const get_entity_values_handler_1 = require("./application/queries/get-entity-values/get-entity-values.handler");
const get_form_schema_handler_1 = require("./application/queries/get-form-schema/get-form-schema.handler");
const CommandHandlers = [
    create_field_definition_handler_1.CreateFieldDefinitionHandler,
    update_field_definition_handler_1.UpdateFieldDefinitionHandler,
    delete_field_definition_handler_1.DeleteFieldDefinitionHandler,
    set_field_value_handler_1.SetFieldValueHandler,
];
const QueryHandlers = [
    get_field_definitions_handler_1.GetFieldDefinitionsHandler,
    get_entity_values_handler_1.GetEntityValuesHandler,
    get_form_schema_handler_1.GetFormSchemaHandler,
];
let CustomFieldsModule = class CustomFieldsModule {
};
exports.CustomFieldsModule = CustomFieldsModule;
exports.CustomFieldsModule = CustomFieldsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [custom_fields_controller_1.CustomFieldsController],
        providers: [...CommandHandlers, ...QueryHandlers],
    })
], CustomFieldsModule);
//# sourceMappingURL=custom-fields.module.js.map