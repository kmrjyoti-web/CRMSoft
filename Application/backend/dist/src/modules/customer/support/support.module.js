"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportModule = void 0;
const common_1 = require("@nestjs/common");
const support_ticket_service_1 = require("./services/support-ticket.service");
const ticket_context_service_1 = require("./services/ticket-context.service");
const support_ticket_controller_1 = require("./presentation/support-ticket.controller");
const vendor_support_controller_1 = require("./presentation/vendor-support.controller");
let SupportModule = class SupportModule {
};
exports.SupportModule = SupportModule;
exports.SupportModule = SupportModule = __decorate([
    (0, common_1.Module)({
        controllers: [support_ticket_controller_1.SupportTicketController, vendor_support_controller_1.VendorSupportController],
        providers: [support_ticket_service_1.SupportTicketService, ticket_context_service_1.TicketContextService],
        exports: [support_ticket_service_1.SupportTicketService],
    })
], SupportModule);
//# sourceMappingURL=support.module.js.map