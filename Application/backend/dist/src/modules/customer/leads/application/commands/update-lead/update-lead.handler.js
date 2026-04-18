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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UpdateLeadHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLeadHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_lead_command_1 = require("./update-lead.command");
const lead_repository_interface_1 = require("../../../domain/interfaces/lead-repository.interface");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let UpdateLeadHandler = UpdateLeadHandler_1 = class UpdateLeadHandler {
    constructor(repo, publisher, prisma) {
        this.repo = repo;
        this.publisher = publisher;
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateLeadHandler_1.name);
    }
    async execute(command) {
        try {
            const lead = await this.repo.findById(command.leadId);
            if (!lead)
                throw new common_1.NotFoundException(`Lead ${command.leadId} not found`);
            const withEvents = this.publisher.mergeObjectContext(lead);
            withEvents.updateDetails(command.data);
            await this.repo.save(withEvents);
            if (command.filterIds !== undefined) {
                await this.prisma.working.leadFilter.deleteMany({
                    where: { leadId: lead.id },
                });
                if (command.filterIds.length) {
                    await this.prisma.working.leadFilter.createMany({
                        data: command.filterIds.map(fid => ({
                            leadId: lead.id,
                            lookupValueId: fid,
                        })),
                        skipDuplicates: true,
                    });
                }
            }
            withEvents.commit();
            this.logger.log(`Lead ${lead.leadNumber} updated`);
        }
        catch (error) {
            this.logger.error(`UpdateLeadHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateLeadHandler = UpdateLeadHandler;
exports.UpdateLeadHandler = UpdateLeadHandler = UpdateLeadHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_lead_command_1.UpdateLeadCommand),
    __param(0, (0, common_1.Inject)(lead_repository_interface_1.LEAD_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher,
        prisma_service_1.PrismaService])
], UpdateLeadHandler);
//# sourceMappingURL=update-lead.handler.js.map