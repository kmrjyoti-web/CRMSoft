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
var ConvertEnquiryHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvertEnquiryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const convert_enquiry_command_1 = require("./convert-enquiry.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let ConvertEnquiryHandler = ConvertEnquiryHandler_1 = class ConvertEnquiryHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(ConvertEnquiryHandler_1.name);
    }
    async execute(command) {
        try {
            const enquiry = await this.mktPrisma.client.mktEnquiry.findFirst({
                where: { id: command.enquiryId, tenantId: command.tenantId, isDeleted: false },
            });
            if (!enquiry)
                throw new common_1.NotFoundException(`Enquiry ${command.enquiryId} not found`);
            await this.mktPrisma.client.mktEnquiry.update({
                where: { id: command.enquiryId },
                data: {
                    status: 'CONVERTED',
                    crmLeadId: command.crmLeadId,
                },
            });
            this.logger.log(`Enquiry ${command.enquiryId} converted to CRM lead ${command.crmLeadId ?? 'N/A'}`);
        }
        catch (error) {
            this.logger.error(`ConvertEnquiryHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ConvertEnquiryHandler = ConvertEnquiryHandler;
exports.ConvertEnquiryHandler = ConvertEnquiryHandler = ConvertEnquiryHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(convert_enquiry_command_1.ConvertEnquiryCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], ConvertEnquiryHandler);
//# sourceMappingURL=convert-enquiry.handler.js.map