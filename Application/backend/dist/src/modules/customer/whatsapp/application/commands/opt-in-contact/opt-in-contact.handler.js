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
var OptInContactHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptInContactHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const opt_in_contact_command_1 = require("./opt-in-contact.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let OptInContactHandler = OptInContactHandler_1 = class OptInContactHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(OptInContactHandler_1.name);
    }
    async execute(cmd) {
        try {
            const result = await this.prisma.working.waOptOut.deleteMany({
                where: {
                    wabaId: cmd.wabaId,
                    phoneNumber: cmd.phoneNumber,
                },
            });
            this.logger.log(`Contact opted in: ${cmd.phoneNumber} for WABA ${cmd.wabaId} (${result.count} record(s) removed)`);
            return result;
        }
        catch (error) {
            this.logger.error(`OptInContactHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.OptInContactHandler = OptInContactHandler;
exports.OptInContactHandler = OptInContactHandler = OptInContactHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(opt_in_contact_command_1.OptInContactCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OptInContactHandler);
//# sourceMappingURL=opt-in-contact.handler.js.map