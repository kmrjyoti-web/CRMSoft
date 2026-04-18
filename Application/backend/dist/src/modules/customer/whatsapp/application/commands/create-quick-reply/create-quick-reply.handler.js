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
var CreateQuickReplyHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateQuickReplyHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_quick_reply_command_1 = require("./create-quick-reply.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let CreateQuickReplyHandler = CreateQuickReplyHandler_1 = class CreateQuickReplyHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateQuickReplyHandler_1.name);
    }
    async execute(cmd) {
        try {
            const quickReply = await this.prisma.working.waQuickReply.create({
                data: {
                    wabaId: cmd.wabaId,
                    shortcut: cmd.shortcut,
                    message: cmd.message,
                    category: cmd.category,
                    createdById: cmd.userId,
                },
            });
            this.logger.log(`Quick reply created: ${quickReply.id} (/${cmd.shortcut}) for WABA ${cmd.wabaId}`);
            return quickReply;
        }
        catch (error) {
            this.logger.error(`CreateQuickReplyHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateQuickReplyHandler = CreateQuickReplyHandler;
exports.CreateQuickReplyHandler = CreateQuickReplyHandler = CreateQuickReplyHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_quick_reply_command_1.CreateQuickReplyCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateQuickReplyHandler);
//# sourceMappingURL=create-quick-reply.handler.js.map