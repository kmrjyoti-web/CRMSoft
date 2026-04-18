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
var ProcessTrackingEventHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessTrackingEventHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const process_tracking_event_command_1 = require("./process-tracking-event.command");
const tracking_service_1 = require("../../../services/tracking.service");
let ProcessTrackingEventHandler = ProcessTrackingEventHandler_1 = class ProcessTrackingEventHandler {
    constructor(trackingService) {
        this.trackingService = trackingService;
        this.logger = new common_1.Logger(ProcessTrackingEventHandler_1.name);
    }
    async execute(cmd) {
        try {
            switch (cmd.eventType) {
                case 'OPEN':
                    if (cmd.trackingPixelId) {
                        await this.trackingService.recordOpen(cmd.trackingPixelId, cmd.ipAddress, cmd.userAgent);
                        this.logger.log(`Tracking event: OPEN for pixel ${cmd.trackingPixelId}`);
                    }
                    break;
                case 'CLICK':
                    if (cmd.emailId && cmd.clickedUrl) {
                        const originalUrl = await this.trackingService.recordClick(cmd.emailId, cmd.clickedUrl, cmd.ipAddress, cmd.userAgent);
                        this.logger.log(`Tracking event: CLICK for email ${cmd.emailId} -> ${cmd.clickedUrl}`);
                        return originalUrl;
                    }
                    break;
                case 'BOUNCE':
                    if (cmd.emailId && cmd.bounceReason) {
                        await this.trackingService.recordBounce(cmd.emailId, cmd.bounceReason);
                        this.logger.log(`Tracking event: BOUNCE for email ${cmd.emailId}`);
                    }
                    break;
            }
            return undefined;
        }
        catch (error) {
            this.logger.error(`ProcessTrackingEventHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ProcessTrackingEventHandler = ProcessTrackingEventHandler;
exports.ProcessTrackingEventHandler = ProcessTrackingEventHandler = ProcessTrackingEventHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(process_tracking_event_command_1.ProcessTrackingEventCommand),
    __metadata("design:paramtypes", [tracking_service_1.TrackingService])
], ProcessTrackingEventHandler);
//# sourceMappingURL=process-tracking-event.handler.js.map