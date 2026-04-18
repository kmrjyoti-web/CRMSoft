"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MarketplaceEngagementEventHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceEngagementEventHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const marketplace_engagement_event_1 = require("./marketplace-engagement.event");
let MarketplaceEngagementEventHandler = MarketplaceEngagementEventHandler_1 = class MarketplaceEngagementEventHandler {
    constructor() {
        this.logger = new common_1.Logger(MarketplaceEngagementEventHandler_1.name);
    }
    handle(event) {
        try {
            this.logger.log(`[Marketplace Engagement] type=${event.type} actor=${event.actorId} ` +
                `target=${event.targetUserId} entity=${event.entityType}:${event.entityId} ` +
                `tenant=${event.tenantId}`);
        }
        catch (error) {
            this.logger.error(`MarketplaceEngagementEventHandler failed: ${error.message}`, error.stack);
        }
    }
};
exports.MarketplaceEngagementEventHandler = MarketplaceEngagementEventHandler;
exports.MarketplaceEngagementEventHandler = MarketplaceEngagementEventHandler = MarketplaceEngagementEventHandler_1 = __decorate([
    (0, cqrs_1.EventsHandler)(marketplace_engagement_event_1.MarketplaceEngagementEvent)
], MarketplaceEngagementEventHandler);
//# sourceMappingURL=marketplace-engagement.handler.js.map