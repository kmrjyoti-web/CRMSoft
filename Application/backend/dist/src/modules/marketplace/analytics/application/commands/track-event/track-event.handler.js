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
var TrackEventHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackEventHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const track_event_command_1 = require("./track-event.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let TrackEventHandler = TrackEventHandler_1 = class TrackEventHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(TrackEventHandler_1.name);
    }
    async execute(command) {
        try {
            await this.mktPrisma.client.mktAnalyticsEvent.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    tenantId: command.tenantId,
                    entityType: command.entityType,
                    entityId: command.entityId,
                    eventType: command.eventType,
                    userId: command.userId,
                    source: command.source ?? 'FEED',
                    deviceType: command.deviceType,
                    city: command.city,
                    state: command.state,
                    pincode: command.pincode,
                    orderValue: command.orderValue,
                    metadata: command.metadata ?? {},
                },
            });
            this.updateEntityCounter(command).catch((err) => this.logger.warn(`Counter update failed for ${command.entityType}/${command.entityId}: ${err.message}`));
        }
        catch (error) {
            this.logger.error(`TrackEventHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateEntityCounter(command) {
        const { entityType, entityId, eventType } = command;
        if (entityType === 'LISTING') {
            const counterMap = {
                VIEW: { viewCount: { increment: 1 } },
                ENQUIRY: { enquiryCount: { increment: 1 } },
                ORDER: { orderCount: { increment: 1 } },
            };
            const data = counterMap[eventType];
            if (data) {
                await this.mktPrisma.client.mktListing.updateMany({
                    where: { id: entityId },
                    data,
                });
            }
        }
        if (entityType === 'POST') {
            const counterMap = {
                VIEW: { viewCount: { increment: 1 } },
                SHARE: { shareCount: { increment: 1 } },
            };
            const data = counterMap[eventType];
            if (data) {
                await this.mktPrisma.client.mktPost.updateMany({
                    where: { id: entityId },
                    data,
                });
            }
        }
        if (entityType === 'OFFER') {
            const counterMap = {
                IMPRESSION: { impressionCount: { increment: 1 } },
                CLICK: { clickCount: { increment: 1 } },
                ENQUIRY: { enquiryCount: { increment: 1 } },
                LEAD: { leadCount: { increment: 1 } },
            };
            const data = counterMap[eventType];
            if (data) {
                await this.mktPrisma.client.mktOffer.updateMany({
                    where: { id: entityId },
                    data,
                });
            }
        }
    }
};
exports.TrackEventHandler = TrackEventHandler;
exports.TrackEventHandler = TrackEventHandler = TrackEventHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(track_event_command_1.TrackEventCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], TrackEventHandler);
//# sourceMappingURL=track-event.handler.js.map