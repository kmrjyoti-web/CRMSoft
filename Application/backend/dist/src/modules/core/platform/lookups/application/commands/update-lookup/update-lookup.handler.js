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
var UpdateLookupHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLookupHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const update_lookup_command_1 = require("./update-lookup.command");
let UpdateLookupHandler = UpdateLookupHandler_1 = class UpdateLookupHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateLookupHandler_1.name);
    }
    async execute(command) {
        try {
            const lookup = await this.prisma.platform.masterLookup.findUnique({
                where: { id: command.lookupId },
            });
            if (!lookup)
                throw new common_1.NotFoundException(`Lookup ${command.lookupId} not found`);
            if (lookup.isSystem)
                throw new common_1.ForbiddenException('Cannot modify system lookup');
            const data = {};
            if (command.data.displayName)
                data.displayName = command.data.displayName.trim();
            if (command.data.description !== undefined)
                data.description = command.data.description?.trim() || null;
            await this.prisma.platform.masterLookup.update({ where: { id: command.lookupId }, data });
            this.logger.log(`Lookup ${lookup.category} updated`);
        }
        catch (error) {
            this.logger.error(`UpdateLookupHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateLookupHandler = UpdateLookupHandler;
exports.UpdateLookupHandler = UpdateLookupHandler = UpdateLookupHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_lookup_command_1.UpdateLookupCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateLookupHandler);
//# sourceMappingURL=update-lookup.handler.js.map