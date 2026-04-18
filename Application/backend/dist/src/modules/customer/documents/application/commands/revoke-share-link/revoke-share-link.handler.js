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
var RevokeShareLinkHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevokeShareLinkHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const revoke_share_link_command_1 = require("./revoke-share-link.command");
const share_link_service_1 = require("../../../services/share-link.service");
let RevokeShareLinkHandler = RevokeShareLinkHandler_1 = class RevokeShareLinkHandler {
    constructor(shareLinkService) {
        this.shareLinkService = shareLinkService;
        this.logger = new common_1.Logger(RevokeShareLinkHandler_1.name);
    }
    async execute(command) {
        try {
            await this.shareLinkService.revokeLink(command.linkId, command.userId);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`RevokeShareLinkHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RevokeShareLinkHandler = RevokeShareLinkHandler;
exports.RevokeShareLinkHandler = RevokeShareLinkHandler = RevokeShareLinkHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(revoke_share_link_command_1.RevokeShareLinkCommand),
    __metadata("design:paramtypes", [share_link_service_1.ShareLinkService])
], RevokeShareLinkHandler);
//# sourceMappingURL=revoke-share-link.handler.js.map