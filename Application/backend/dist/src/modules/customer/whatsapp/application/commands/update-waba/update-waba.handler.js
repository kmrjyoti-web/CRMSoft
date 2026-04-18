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
var UpdateWabaHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWabaHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_waba_command_1 = require("./update-waba.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let UpdateWabaHandler = UpdateWabaHandler_1 = class UpdateWabaHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateWabaHandler_1.name);
    }
    async execute(cmd) {
        try {
            const updateData = {};
            if (cmd.displayName !== undefined)
                updateData.displayName = cmd.displayName;
            if (cmd.accessToken !== undefined)
                updateData.accessToken = cmd.accessToken;
            if (cmd.settings !== undefined)
                updateData.settings = cmd.settings;
            const waba = await this.prisma.working.whatsAppBusinessAccount.update({
                where: { id: cmd.id },
                data: updateData,
            });
            this.logger.log(`WABA updated: ${waba.id}`);
            return waba;
        }
        catch (error) {
            this.logger.error(`UpdateWabaHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateWabaHandler = UpdateWabaHandler;
exports.UpdateWabaHandler = UpdateWabaHandler = UpdateWabaHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_waba_command_1.UpdateWabaCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateWabaHandler);
//# sourceMappingURL=update-waba.handler.js.map