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
var CreateEnquiryHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEnquiryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const create_enquiry_command_1 = require("./create-enquiry.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let CreateEnquiryHandler = CreateEnquiryHandler_1 = class CreateEnquiryHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(CreateEnquiryHandler_1.name);
    }
    async execute(command) {
        try {
            const listing = await this.mktPrisma.client.mktListing.findFirst({
                where: { id: command.listingId, tenantId: command.tenantId, isDeleted: false, status: 'ACTIVE' },
            });
            if (!listing) {
                throw new common_1.NotFoundException(`Active listing ${command.listingId} not found`);
            }
            const id = (0, crypto_1.randomUUID)();
            const enquiry = await this.mktPrisma.client.mktEnquiry.create({
                data: {
                    id,
                    tenantId: command.tenantId,
                    listingId: command.listingId,
                    enquirerId: command.enquirerId,
                    message: command.message,
                    quantity: command.quantity,
                    expectedPrice: command.expectedPrice,
                    deliveryPincode: command.deliveryPincode,
                    status: 'OPEN',
                },
            });
            await this.mktPrisma.client.mktListing.update({
                where: { id: command.listingId },
                data: { enquiryCount: { increment: 1 } },
            });
            this.logger.log(`Enquiry ${id} created for listing ${command.listingId}`);
            return enquiry.id;
        }
        catch (error) {
            this.logger.error(`CreateEnquiryHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateEnquiryHandler = CreateEnquiryHandler;
exports.CreateEnquiryHandler = CreateEnquiryHandler = CreateEnquiryHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_enquiry_command_1.CreateEnquiryCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], CreateEnquiryHandler);
//# sourceMappingURL=create-enquiry.handler.js.map