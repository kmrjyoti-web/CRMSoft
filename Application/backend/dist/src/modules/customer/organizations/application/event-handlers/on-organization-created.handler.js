"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OnOrganizationCreatedHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnOrganizationCreatedHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const organization_created_event_1 = require("../../domain/events/organization-created.event");
let OnOrganizationCreatedHandler = OnOrganizationCreatedHandler_1 = class OnOrganizationCreatedHandler {
    constructor() {
        this.logger = new common_1.Logger(OnOrganizationCreatedHandler_1.name);
    }
    handle(event) {
        try {
            this.logger.log(`New organization: ${event.name} (industry: ${event.industry || 'N/A'})`);
        }
        catch (error) {
            this.logger.error(`OnOrganizationCreatedHandler failed: ${error.message}`, error.stack);
        }
    }
};
exports.OnOrganizationCreatedHandler = OnOrganizationCreatedHandler;
exports.OnOrganizationCreatedHandler = OnOrganizationCreatedHandler = OnOrganizationCreatedHandler_1 = __decorate([
    (0, cqrs_1.EventsHandler)(organization_created_event_1.OrganizationCreatedEvent)
], OnOrganizationCreatedHandler);
//# sourceMappingURL=on-organization-created.handler.js.map