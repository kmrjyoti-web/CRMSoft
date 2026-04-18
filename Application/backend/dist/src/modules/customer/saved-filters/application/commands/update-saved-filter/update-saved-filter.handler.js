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
var UpdateSavedFilterHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSavedFilterHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_saved_filter_command_1 = require("./update-saved-filter.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let UpdateSavedFilterHandler = UpdateSavedFilterHandler_1 = class UpdateSavedFilterHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateSavedFilterHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.savedFilter.findFirst({ where: { id: cmd.id, isDeleted: false } });
            if (!existing)
                throw new common_1.NotFoundException('SavedFilter not found');
            if (cmd.data.isDefault) {
                await this.prisma.working.savedFilter.updateMany({
                    where: {
                        createdById: cmd.userId,
                        entityType: existing.entityType,
                        isDefault: true,
                        isDeleted: false,
                        id: { not: cmd.id },
                    },
                    data: { isDefault: false },
                });
            }
            return this.prisma.working.savedFilter.update({ where: { id: cmd.id }, data: cmd.data });
        }
        catch (error) {
            this.logger.error(`UpdateSavedFilterHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateSavedFilterHandler = UpdateSavedFilterHandler;
exports.UpdateSavedFilterHandler = UpdateSavedFilterHandler = UpdateSavedFilterHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_saved_filter_command_1.UpdateSavedFilterCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateSavedFilterHandler);
//# sourceMappingURL=update-saved-filter.handler.js.map