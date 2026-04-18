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
var CreateShareLinkHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateShareLinkHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_share_link_command_1 = require("./create-share-link.command");
const share_link_service_1 = require("../../../services/share-link.service");
const document_activity_service_1 = require("../../../services/document-activity.service");
let CreateShareLinkHandler = CreateShareLinkHandler_1 = class CreateShareLinkHandler {
    constructor(shareLinkService, activityService) {
        this.shareLinkService = shareLinkService;
        this.activityService = activityService;
        this.logger = new common_1.Logger(CreateShareLinkHandler_1.name);
    }
    async execute(command) {
        try {
            const link = await this.shareLinkService.createLink({
                documentId: command.documentId,
                access: command.access,
                password: command.password,
                expiresAt: command.expiresAt,
                maxViews: command.maxViews,
                createdById: command.userId,
            });
            await this.activityService.log({
                documentId: command.documentId,
                action: 'SHARED',
                userId: command.userId,
                details: { shareLinkId: link.id, access: link.access },
            });
            return link;
        }
        catch (error) {
            this.logger.error(`CreateShareLinkHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateShareLinkHandler = CreateShareLinkHandler;
exports.CreateShareLinkHandler = CreateShareLinkHandler = CreateShareLinkHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_share_link_command_1.CreateShareLinkCommand),
    __metadata("design:paramtypes", [share_link_service_1.ShareLinkService,
        document_activity_service_1.DocumentActivityService])
], CreateShareLinkHandler);
//# sourceMappingURL=create-share-link.handler.js.map