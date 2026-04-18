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
var ReactivateLeadHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactivateLeadHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const reactivate_lead_command_1 = require("./reactivate-lead.command");
const lead_repository_interface_1 = require("../../../domain/interfaces/lead-repository.interface");
let ReactivateLeadHandler = ReactivateLeadHandler_1 = class ReactivateLeadHandler {
    constructor(repo, publisher) {
        this.repo = repo;
        this.publisher = publisher;
        this.logger = new common_1.Logger(ReactivateLeadHandler_1.name);
    }
    async execute(command) {
        try {
            const lead = await this.repo.findById(command.leadId);
            if (!lead)
                throw new common_1.NotFoundException(`Lead ${command.leadId} not found`);
            const withEvents = this.publisher.mergeObjectContext(lead);
            withEvents.reactivate();
            await this.repo.save(withEvents);
            withEvents.commit();
            this.logger.log(`Lead ${lead.id} reactivated`);
        }
        catch (error) {
            this.logger.error(`ReactivateLeadHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ReactivateLeadHandler = ReactivateLeadHandler;
exports.ReactivateLeadHandler = ReactivateLeadHandler = ReactivateLeadHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(reactivate_lead_command_1.ReactivateLeadCommand),
    __param(0, (0, common_1.Inject)(lead_repository_interface_1.LEAD_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventPublisher])
], ReactivateLeadHandler);
//# sourceMappingURL=reactivate-lead.handler.js.map