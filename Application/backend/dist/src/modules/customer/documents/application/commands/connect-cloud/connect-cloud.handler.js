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
var ConnectCloudHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectCloudHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const connect_cloud_command_1 = require("./connect-cloud.command");
const cloud_provider_service_1 = require("../../../services/cloud-provider.service");
let ConnectCloudHandler = ConnectCloudHandler_1 = class ConnectCloudHandler {
    constructor(cloudProvider) {
        this.cloudProvider = cloudProvider;
        this.logger = new common_1.Logger(ConnectCloudHandler_1.name);
    }
    async execute(command) {
        try {
            return this.cloudProvider.connectProvider(command.userId, command.provider, command.accessToken, command.refreshToken, command.tokenExpiry, command.accountEmail, command.accountName);
        }
        catch (error) {
            this.logger.error(`ConnectCloudHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ConnectCloudHandler = ConnectCloudHandler;
exports.ConnectCloudHandler = ConnectCloudHandler = ConnectCloudHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(connect_cloud_command_1.ConnectCloudCommand),
    __metadata("design:paramtypes", [cloud_provider_service_1.CloudProviderService])
], ConnectCloudHandler);
//# sourceMappingURL=connect-cloud.handler.js.map