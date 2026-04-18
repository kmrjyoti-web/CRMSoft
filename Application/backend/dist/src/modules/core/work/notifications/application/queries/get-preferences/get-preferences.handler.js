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
var GetPreferencesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPreferencesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_preferences_query_1 = require("./get-preferences.query");
const preference_service_1 = require("../../../services/preference.service");
let GetPreferencesHandler = GetPreferencesHandler_1 = class GetPreferencesHandler {
    constructor(preferenceService) {
        this.preferenceService = preferenceService;
        this.logger = new common_1.Logger(GetPreferencesHandler_1.name);
    }
    async execute(query) {
        try {
            return this.preferenceService.getPreferences(query.userId);
        }
        catch (error) {
            this.logger.error(`GetPreferencesHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetPreferencesHandler = GetPreferencesHandler;
exports.GetPreferencesHandler = GetPreferencesHandler = GetPreferencesHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_preferences_query_1.GetPreferencesQuery),
    __metadata("design:paramtypes", [preference_service_1.PreferenceService])
], GetPreferencesHandler);
//# sourceMappingURL=get-preferences.handler.js.map