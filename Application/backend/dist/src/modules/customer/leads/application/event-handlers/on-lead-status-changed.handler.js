"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OnLeadStatusChangedHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnLeadStatusChangedHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const lead_status_changed_event_1 = require("../../domain/events/lead-status-changed.event");
let OnLeadStatusChangedHandler = OnLeadStatusChangedHandler_1 = class OnLeadStatusChangedHandler {
    constructor() {
        this.logger = new common_1.Logger(OnLeadStatusChangedHandler_1.name);
    }
    handle(event) {
        try {
            this.logger.log(`Lead ${event.leadId}: ${event.fromStatus} → ${event.toStatus}`);
        }
        catch (error) {
            this.logger.error(`OnLeadStatusChangedHandler failed: ${error.message}`, error.stack);
        }
    }
};
exports.OnLeadStatusChangedHandler = OnLeadStatusChangedHandler;
exports.OnLeadStatusChangedHandler = OnLeadStatusChangedHandler = OnLeadStatusChangedHandler_1 = __decorate([
    (0, cqrs_1.EventsHandler)(lead_status_changed_event_1.LeadStatusChangedEvent)
], OnLeadStatusChangedHandler);
//# sourceMappingURL=on-lead-status-changed.handler.js.map