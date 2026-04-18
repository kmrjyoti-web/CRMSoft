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
var OptOutContactHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptOutContactHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const opt_out_contact_command_1 = require("./opt-out-contact.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let OptOutContactHandler = OptOutContactHandler_1 = class OptOutContactHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(OptOutContactHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.waOptOut.findFirst({
                where: { wabaId: cmd.wabaId, phoneNumber: cmd.phoneNumber },
            });
            let optOut;
            if (existing) {
                optOut = await this.prisma.working.waOptOut.update({
                    where: { id: existing.id },
                    data: {
                        contactId: cmd.contactId,
                        reason: cmd.reason,
                    },
                });
            }
            else {
                optOut = await this.prisma.working.waOptOut.create({
                    data: {
                        wabaId: cmd.wabaId,
                        phoneNumber: cmd.phoneNumber,
                        contactId: cmd.contactId,
                        reason: cmd.reason,
                    },
                });
            }
            this.logger.log(`Contact opted out: ${cmd.phoneNumber} from WABA ${cmd.wabaId}`);
            return optOut;
        }
        catch (error) {
            this.logger.error(`OptOutContactHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.OptOutContactHandler = OptOutContactHandler;
exports.OptOutContactHandler = OptOutContactHandler = OptOutContactHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(opt_out_contact_command_1.OptOutContactCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OptOutContactHandler);
//# sourceMappingURL=opt-out-contact.handler.js.map