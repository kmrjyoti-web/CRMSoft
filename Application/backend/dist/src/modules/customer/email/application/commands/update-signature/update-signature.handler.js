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
var UpdateSignatureHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSignatureHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_signature_command_1 = require("./update-signature.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let UpdateSignatureHandler = UpdateSignatureHandler_1 = class UpdateSignatureHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateSignatureHandler_1.name);
    }
    async execute(cmd) {
        try {
            if (cmd.isDefault) {
                const existing = await this.prisma.working.emailSignature.findUniqueOrThrow({
                    where: { id: cmd.id },
                });
                await this.prisma.working.emailSignature.updateMany({
                    where: { userId: existing.userId },
                    data: { isDefault: false },
                });
            }
            const data = {};
            if (cmd.name !== undefined)
                data.name = cmd.name;
            if (cmd.bodyHtml !== undefined)
                data.bodyHtml = cmd.bodyHtml;
            if (cmd.isDefault !== undefined)
                data.isDefault = cmd.isDefault;
            const signature = await this.prisma.working.emailSignature.update({
                where: { id: cmd.id },
                data,
            });
            this.logger.log(`Email signature updated: ${cmd.id}`);
            return signature;
        }
        catch (error) {
            this.logger.error(`UpdateSignatureHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateSignatureHandler = UpdateSignatureHandler;
exports.UpdateSignatureHandler = UpdateSignatureHandler = UpdateSignatureHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_signature_command_1.UpdateSignatureCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateSignatureHandler);
//# sourceMappingURL=update-signature.handler.js.map