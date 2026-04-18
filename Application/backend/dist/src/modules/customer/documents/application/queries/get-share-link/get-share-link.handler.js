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
var GetShareLinkHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetShareLinkHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_share_link_query_1 = require("./get-share-link.query");
const share_link_service_1 = require("../../../services/share-link.service");
let GetShareLinkHandler = GetShareLinkHandler_1 = class GetShareLinkHandler {
    constructor(shareLinkService) {
        this.shareLinkService = shareLinkService;
        this.logger = new common_1.Logger(GetShareLinkHandler_1.name);
    }
    async execute(query) {
        try {
            return this.shareLinkService.accessLink(query.token, query.password);
        }
        catch (error) {
            this.logger.error(`GetShareLinkHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetShareLinkHandler = GetShareLinkHandler;
exports.GetShareLinkHandler = GetShareLinkHandler = GetShareLinkHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_share_link_query_1.GetShareLinkQuery),
    __metadata("design:paramtypes", [share_link_service_1.ShareLinkService])
], GetShareLinkHandler);
//# sourceMappingURL=get-share-link.handler.js.map