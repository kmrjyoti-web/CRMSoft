"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GetTemplatesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTemplatesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_templates_query_1 = require("./get-templates.query");
const template_service_1 = require("../../../services/template.service");
let GetTemplatesHandler = GetTemplatesHandler_1 = class GetTemplatesHandler {
    constructor(templateService) {
        this.templateService = templateService;
        this.logger = new common_1.Logger(GetTemplatesHandler_1.name);
    }
    async execute(query) {
        try {
            return this.templateService.getAll({
                category: query.category,
                isActive: query.isActive,
            });
        }
        catch (error) {
            this.logger.error(`GetTemplatesHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetTemplatesHandler = GetTemplatesHandler;
exports.GetTemplatesHandler = GetTemplatesHandler = GetTemplatesHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_templates_query_1.GetTemplatesQuery),
    __metadata("design:paramtypes", [template_service_1.NotificationTemplateService])
], GetTemplatesHandler);
//# sourceMappingURL=get-templates.handler.js.map