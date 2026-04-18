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
var StarEmailHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StarEmailHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const star_email_command_1 = require("./star-email.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let StarEmailHandler = StarEmailHandler_1 = class StarEmailHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(StarEmailHandler_1.name);
    }
    async execute(cmd) {
        try {
            const email = await this.prisma.working.email.update({
                where: { id: cmd.emailId },
                data: { isStarred: cmd.starred },
            });
            return email;
        }
        catch (error) {
            this.logger.error(`StarEmailHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.StarEmailHandler = StarEmailHandler;
exports.StarEmailHandler = StarEmailHandler = StarEmailHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(star_email_command_1.StarEmailCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StarEmailHandler);
//# sourceMappingURL=star-email.handler.js.map