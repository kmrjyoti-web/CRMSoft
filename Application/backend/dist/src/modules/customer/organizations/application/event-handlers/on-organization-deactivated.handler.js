"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OnOrganizationDeactivatedHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnOrganizationDeactivatedHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const organization_deactivated_event_1 = require("../../domain/events/organization-deactivated.event");
let OnOrganizationDeactivatedHandler = OnOrganizationDeactivatedHandler_1 = class OnOrganizationDeactivatedHandler {
    constructor() {
        this.logger = new common_1.Logger(OnOrganizationDeactivatedHandler_1.name);
    }
    handle(event) {
        try {
            this.logger.log(`Organization deactivated: ${event.name} (${event.organizationId})`);
        }
        catch (error) {
            this.logger.error(`OnOrganizationDeactivatedHandler failed: ${error.message}`, error.stack);
        }
    }
};
exports.OnOrganizationDeactivatedHandler = OnOrganizationDeactivatedHandler;
exports.OnOrganizationDeactivatedHandler = OnOrganizationDeactivatedHandler = OnOrganizationDeactivatedHandler_1 = __decorate([
    (0, cqrs_1.EventsHandler)(organization_deactivated_event_1.OrganizationDeactivatedEvent)
], OnOrganizationDeactivatedHandler);
//# sourceMappingURL=on-organization-deactivated.handler.js.map