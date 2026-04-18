"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OnLeadAllocatedHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnLeadAllocatedHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const lead_allocated_event_1 = require("../../domain/events/lead-allocated.event");
let OnLeadAllocatedHandler = OnLeadAllocatedHandler_1 = class OnLeadAllocatedHandler {
    constructor() {
        this.logger = new common_1.Logger(OnLeadAllocatedHandler_1.name);
    }
    handle(event) {
        try {
            this.logger.log(`Lead ${event.leadId} allocated to ${event.allocatedToId}`);
        }
        catch (error) {
            this.logger.error(`OnLeadAllocatedHandler failed: ${error.message}`, error.stack);
        }
    }
};
exports.OnLeadAllocatedHandler = OnLeadAllocatedHandler;
exports.OnLeadAllocatedHandler = OnLeadAllocatedHandler = OnLeadAllocatedHandler_1 = __decorate([
    (0, cqrs_1.EventsHandler)(lead_allocated_event_1.LeadAllocatedEvent)
], OnLeadAllocatedHandler);
//# sourceMappingURL=on-lead-allocated.handler.js.map