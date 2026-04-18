"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnquiriesModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const enquiries_controller_1 = require("./presentation/enquiries.controller");
const mkt_prisma_service_1 = require("./infrastructure/mkt-prisma.service");
const create_enquiry_handler_1 = require("./application/commands/create-enquiry/create-enquiry.handler");
const convert_enquiry_handler_1 = require("./application/commands/convert-enquiry/convert-enquiry.handler");
const list_enquiries_handler_1 = require("./application/queries/list-enquiries/list-enquiries.handler");
const CommandHandlers = [create_enquiry_handler_1.CreateEnquiryHandler, convert_enquiry_handler_1.ConvertEnquiryHandler];
const QueryHandlers = [list_enquiries_handler_1.ListEnquiriesHandler];
let EnquiriesModule = class EnquiriesModule {
};
exports.EnquiriesModule = EnquiriesModule;
exports.EnquiriesModule = EnquiriesModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [enquiries_controller_1.EnquiriesController],
        providers: [mkt_prisma_service_1.MktPrismaService, ...CommandHandlers, ...QueryHandlers],
    })
], EnquiriesModule);
//# sourceMappingURL=enquiries.module.js.map