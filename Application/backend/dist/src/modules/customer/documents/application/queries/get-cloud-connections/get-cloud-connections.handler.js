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
var GetCloudConnectionsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCloudConnectionsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_cloud_connections_query_1 = require("./get-cloud-connections.query");
const cloud_provider_service_1 = require("../../../services/cloud-provider.service");
let GetCloudConnectionsHandler = GetCloudConnectionsHandler_1 = class GetCloudConnectionsHandler {
    constructor(cloudProvider) {
        this.cloudProvider = cloudProvider;
        this.logger = new common_1.Logger(GetCloudConnectionsHandler_1.name);
    }
    async execute(query) {
        try {
            return this.cloudProvider.getConnections(query.userId);
        }
        catch (error) {
            this.logger.error(`GetCloudConnectionsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetCloudConnectionsHandler = GetCloudConnectionsHandler;
exports.GetCloudConnectionsHandler = GetCloudConnectionsHandler = GetCloudConnectionsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_cloud_connections_query_1.GetCloudConnectionsQuery),
    __metadata("design:paramtypes", [cloud_provider_service_1.CloudProviderService])
], GetCloudConnectionsHandler);
//# sourceMappingURL=get-cloud-connections.handler.js.map