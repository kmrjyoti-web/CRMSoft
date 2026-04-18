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
var DeleteSavedFilterHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteSavedFilterHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_saved_filter_command_1 = require("./delete-saved-filter.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let DeleteSavedFilterHandler = DeleteSavedFilterHandler_1 = class DeleteSavedFilterHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DeleteSavedFilterHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.savedFilter.findFirst({ where: { id: cmd.id, isDeleted: false } });
            if (!existing)
                throw new common_1.NotFoundException('SavedFilter not found');
            return this.prisma.working.savedFilter.update({
                where: { id: cmd.id },
                data: { isDeleted: true, deletedAt: new Date() },
            });
        }
        catch (error) {
            this.logger.error(`DeleteSavedFilterHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeleteSavedFilterHandler = DeleteSavedFilterHandler;
exports.DeleteSavedFilterHandler = DeleteSavedFilterHandler = DeleteSavedFilterHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(delete_saved_filter_command_1.DeleteSavedFilterCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeleteSavedFilterHandler);
//# sourceMappingURL=delete-saved-filter.handler.js.map