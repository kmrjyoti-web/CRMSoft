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
var CreateSavedFilterHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSavedFilterHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_saved_filter_command_1 = require("./create-saved-filter.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let CreateSavedFilterHandler = CreateSavedFilterHandler_1 = class CreateSavedFilterHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateSavedFilterHandler_1.name);
    }
    async execute(cmd) {
        try {
            if (cmd.isDefault) {
                await this.prisma.working.savedFilter.updateMany({
                    where: { createdById: cmd.createdById, entityType: cmd.entityType, isDefault: true, isDeleted: false },
                    data: { isDefault: false },
                });
            }
            return this.prisma.working.savedFilter.create({
                data: {
                    name: cmd.name,
                    entityType: cmd.entityType,
                    filterConfig: cmd.filterConfig,
                    description: cmd.description,
                    isDefault: cmd.isDefault ?? false,
                    isShared: cmd.isShared ?? false,
                    sharedWithRoles: cmd.sharedWithRoles ?? [],
                    createdById: cmd.createdById,
                },
            });
        }
        catch (error) {
            this.logger.error(`CreateSavedFilterHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateSavedFilterHandler = CreateSavedFilterHandler;
exports.CreateSavedFilterHandler = CreateSavedFilterHandler = CreateSavedFilterHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_saved_filter_command_1.CreateSavedFilterCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateSavedFilterHandler);
//# sourceMappingURL=create-saved-filter.handler.js.map