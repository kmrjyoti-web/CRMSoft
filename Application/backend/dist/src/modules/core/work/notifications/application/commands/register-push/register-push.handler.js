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
var RegisterPushHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterPushHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const register_push_command_1 = require("./register-push.command");
const preference_service_1 = require("../../../services/preference.service");
let RegisterPushHandler = RegisterPushHandler_1 = class RegisterPushHandler {
    constructor(preferenceService) {
        this.preferenceService = preferenceService;
        this.logger = new common_1.Logger(RegisterPushHandler_1.name);
    }
    async execute(command) {
        try {
            return this.preferenceService.registerPushSubscription(command.userId, {
                endpoint: command.endpoint,
                p256dh: command.p256dh,
                auth: command.auth,
                deviceType: command.deviceType,
            });
        }
        catch (error) {
            this.logger.error(`RegisterPushHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RegisterPushHandler = RegisterPushHandler;
exports.RegisterPushHandler = RegisterPushHandler = RegisterPushHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(register_push_command_1.RegisterPushCommand),
    __metadata("design:paramtypes", [preference_service_1.PreferenceService])
], RegisterPushHandler);
//# sourceMappingURL=register-push.handler.js.map