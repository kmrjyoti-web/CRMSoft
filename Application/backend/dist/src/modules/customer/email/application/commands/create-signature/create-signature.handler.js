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
var CreateSignatureHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSignatureHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_signature_command_1 = require("./create-signature.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let CreateSignatureHandler = CreateSignatureHandler_1 = class CreateSignatureHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateSignatureHandler_1.name);
    }
    async execute(cmd) {
        try {
            if (cmd.isDefault) {
                await this.prisma.working.emailSignature.updateMany({
                    where: { userId: cmd.userId },
                    data: { isDefault: false },
                });
            }
            const signature = await this.prisma.working.emailSignature.create({
                data: {
                    name: cmd.name,
                    bodyHtml: cmd.bodyHtml,
                    isDefault: cmd.isDefault,
                    userId: cmd.userId,
                },
            });
            this.logger.log(`Email signature created: ${signature.id} (${cmd.name})`);
            return signature;
        }
        catch (error) {
            this.logger.error(`CreateSignatureHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateSignatureHandler = CreateSignatureHandler;
exports.CreateSignatureHandler = CreateSignatureHandler = CreateSignatureHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_signature_command_1.CreateSignatureCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateSignatureHandler);
//# sourceMappingURL=create-signature.handler.js.map