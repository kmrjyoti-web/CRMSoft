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
var DeleteSignatureHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteSignatureHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_signature_command_1 = require("./delete-signature.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let DeleteSignatureHandler = DeleteSignatureHandler_1 = class DeleteSignatureHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DeleteSignatureHandler_1.name);
    }
    async execute(cmd) {
        try {
            await this.prisma.working.emailSignature.delete({
                where: { id: cmd.id },
            });
            this.logger.log(`Email signature deleted: ${cmd.id}`);
        }
        catch (error) {
            this.logger.error(`DeleteSignatureHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeleteSignatureHandler = DeleteSignatureHandler;
exports.DeleteSignatureHandler = DeleteSignatureHandler = DeleteSignatureHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(delete_signature_command_1.DeleteSignatureCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeleteSignatureHandler);
//# sourceMappingURL=delete-signature.handler.js.map