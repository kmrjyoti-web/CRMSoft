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
var CreateLookupHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLookupHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const create_lookup_command_1 = require("./create-lookup.command");
let CreateLookupHandler = CreateLookupHandler_1 = class CreateLookupHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateLookupHandler_1.name);
    }
    async execute(command) {
        try {
            const category = command.category.toUpperCase().replace(/\s+/g, '_');
            const existing = await this.prisma.platform.masterLookup.findFirst({
                where: { category },
            });
            if (existing)
                throw new common_1.ConflictException(`Lookup category "${category}" already exists`);
            const lookup = await this.prisma.platform.masterLookup.create({
                data: {
                    category,
                    displayName: command.displayName.trim(),
                    description: command.description?.trim() || null,
                    isSystem: command.isSystem ?? false,
                },
            });
            this.logger.log(`Lookup created: ${category}`);
            return lookup.id;
        }
        catch (error) {
            this.logger.error(`CreateLookupHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateLookupHandler = CreateLookupHandler;
exports.CreateLookupHandler = CreateLookupHandler = CreateLookupHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_lookup_command_1.CreateLookupCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateLookupHandler);
//# sourceMappingURL=create-lookup.handler.js.map