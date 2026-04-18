"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OnContactDeactivatedHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnContactDeactivatedHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const contact_deactivated_event_1 = require("../../domain/events/contact-deactivated.event");
let OnContactDeactivatedHandler = OnContactDeactivatedHandler_1 = class OnContactDeactivatedHandler {
    constructor() {
        this.logger = new common_1.Logger(OnContactDeactivatedHandler_1.name);
    }
    handle(event) {
        try {
            this.logger.log(`Contact deactivated: ${event.firstName} ${event.lastName} (${event.contactId})`);
        }
        catch (error) {
            this.logger.error(`OnContactDeactivatedHandler failed: ${error.message}`, error.stack);
        }
    }
};
exports.OnContactDeactivatedHandler = OnContactDeactivatedHandler;
exports.OnContactDeactivatedHandler = OnContactDeactivatedHandler = OnContactDeactivatedHandler_1 = __decorate([
    (0, cqrs_1.EventsHandler)(contact_deactivated_event_1.ContactDeactivatedEvent)
], OnContactDeactivatedHandler);
//# sourceMappingURL=on-contact-deactivated.handler.js.map