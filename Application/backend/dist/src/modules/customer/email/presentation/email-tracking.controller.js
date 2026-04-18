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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailTrackingController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const process_tracking_event_command_1 = require("../application/commands/process-tracking-event/process-tracking-event.command");
let EmailTrackingController = class EmailTrackingController {
    constructor(commandBus) {
        this.commandBus = commandBus;
    }
    async trackOpen(emailId, ipAddress, userAgent, res) {
        try {
            await this.commandBus.execute(new process_tracking_event_command_1.ProcessTrackingEventCommand('OPEN', emailId, undefined, undefined, ipAddress, userAgent));
        }
        catch {
        }
        const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.set('Content-Type', 'image/gif');
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.send(pixel);
    }
    async trackClick(emailId, url, ipAddress, userAgent, res) {
        try {
            await this.commandBus.execute(new process_tracking_event_command_1.ProcessTrackingEventCommand('CLICK', emailId, undefined, url, ipAddress, userAgent));
        }
        catch {
        }
        res.redirect(decodeURIComponent(url));
    }
    async trackBounce(emailId, reason) {
        await this.commandBus.execute(new process_tracking_event_command_1.ProcessTrackingEventCommand('BOUNCE', emailId, undefined, undefined, undefined, undefined, reason));
        return { success: true };
    }
};
exports.EmailTrackingController = EmailTrackingController;
__decorate([
    (0, common_1.Get)('open/:emailId'),
    __param(0, (0, common_1.Param)('emailId')),
    __param(1, (0, common_1.Query)('ip')),
    __param(2, (0, common_1.Query)('ua')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], EmailTrackingController.prototype, "trackOpen", null);
__decorate([
    (0, common_1.Get)('click/:emailId'),
    __param(0, (0, common_1.Param)('emailId')),
    __param(1, (0, common_1.Query)('url')),
    __param(2, (0, common_1.Query)('ip')),
    __param(3, (0, common_1.Query)('ua')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], EmailTrackingController.prototype, "trackClick", null);
__decorate([
    (0, common_1.Post)('bounce'),
    __param(0, (0, common_1.Body)('emailId')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmailTrackingController.prototype, "trackBounce", null);
exports.EmailTrackingController = EmailTrackingController = __decorate([
    (0, swagger_1.ApiTags)('Email Tracking'),
    (0, common_1.Controller)('email-tracking'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus])
], EmailTrackingController);
//# sourceMappingURL=email-tracking.controller.js.map