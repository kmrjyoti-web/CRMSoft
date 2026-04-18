"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OnRawContactCreatedHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnRawContactCreatedHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const raw_contact_created_event_1 = require("../../domain/events/raw-contact-created.event");
let OnRawContactCreatedHandler = OnRawContactCreatedHandler_1 = class OnRawContactCreatedHandler {
    constructor() {
        this.logger = new common_1.Logger(OnRawContactCreatedHandler_1.name);
    }
    handle(event) {
        try {
            this.logger.log(`New raw contact: ${event.firstName} ${event.lastName} (source: ${event.source})`);
        }
        catch (error) {
            this.logger.error(`OnRawContactCreatedHandler failed: ${error.message}`, error.stack);
        }
    }
};
exports.OnRawContactCreatedHandler = OnRawContactCreatedHandler;
exports.OnRawContactCreatedHandler = OnRawContactCreatedHandler = OnRawContactCreatedHandler_1 = __decorate([
    (0, cqrs_1.EventsHandler)(raw_contact_created_event_1.RawContactCreatedEvent)
], OnRawContactCreatedHandler);
//# sourceMappingURL=on-raw-contact-created.handler.js.map