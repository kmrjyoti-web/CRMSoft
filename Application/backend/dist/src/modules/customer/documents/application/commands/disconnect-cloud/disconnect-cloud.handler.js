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
var DisconnectCloudHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisconnectCloudHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const disconnect_cloud_command_1 = require("./disconnect-cloud.command");
const cloud_provider_service_1 = require("../../../services/cloud-provider.service");
let DisconnectCloudHandler = DisconnectCloudHandler_1 = class DisconnectCloudHandler {
    constructor(cloudProvider) {
        this.cloudProvider = cloudProvider;
        this.logger = new common_1.Logger(DisconnectCloudHandler_1.name);
    }
    async execute(command) {
        try {
            await this.cloudProvider.disconnectProvider(command.userId, command.provider);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`DisconnectCloudHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DisconnectCloudHandler = DisconnectCloudHandler;
exports.DisconnectCloudHandler = DisconnectCloudHandler = DisconnectCloudHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(disconnect_cloud_command_1.DisconnectCloudCommand),
    __metadata("design:paramtypes", [cloud_provider_service_1.CloudProviderService])
], DisconnectCloudHandler);
//# sourceMappingURL=disconnect-cloud.handler.js.map