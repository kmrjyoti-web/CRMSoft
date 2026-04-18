"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OnLeadCreatedHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnLeadCreatedHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const lead_created_event_1 = require("../../domain/events/lead-created.event");
let OnLeadCreatedHandler = OnLeadCreatedHandler_1 = class OnLeadCreatedHandler {
    constructor() {
        this.logger = new common_1.Logger(OnLeadCreatedHandler_1.name);
    }
    handle(event) {
        try {
            this.logger.log(`Lead ${event.leadId} created for contact ${event.contactId}`);
        }
        catch (error) {
            this.logger.error(`OnLeadCreatedHandler failed: ${error.message}`, error.stack);
        }
    }
};
exports.OnLeadCreatedHandler = OnLeadCreatedHandler;
exports.OnLeadCreatedHandler = OnLeadCreatedHandler = OnLeadCreatedHandler_1 = __decorate([
    (0, cqrs_1.EventsHandler)(lead_created_event_1.LeadCreatedEvent)
], OnLeadCreatedHandler);
//# sourceMappingURL=on-lead-created.handler.js.map