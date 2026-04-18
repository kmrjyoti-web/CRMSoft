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
var UpdatePreferencesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePreferencesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_preferences_command_1 = require("./update-preferences.command");
const preference_service_1 = require("../../../services/preference.service");
let UpdatePreferencesHandler = UpdatePreferencesHandler_1 = class UpdatePreferencesHandler {
    constructor(preferenceService) {
        this.preferenceService = preferenceService;
        this.logger = new common_1.Logger(UpdatePreferencesHandler_1.name);
    }
    async execute(command) {
        try {
            return this.preferenceService.updatePreferences(command.userId, {
                channels: command.channels,
                categories: command.categories,
                quietHoursStart: command.quietHoursStart,
                quietHoursEnd: command.quietHoursEnd,
                digestFrequency: command.digestFrequency,
                timezone: command.timezone,
            });
        }
        catch (error) {
            this.logger.error(`UpdatePreferencesHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdatePreferencesHandler = UpdatePreferencesHandler;
exports.UpdatePreferencesHandler = UpdatePreferencesHandler = UpdatePreferencesHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_preferences_command_1.UpdatePreferencesCommand),
    __metadata("design:paramtypes", [preference_service_1.PreferenceService])
], UpdatePreferencesHandler);
//# sourceMappingURL=update-preferences.handler.js.map