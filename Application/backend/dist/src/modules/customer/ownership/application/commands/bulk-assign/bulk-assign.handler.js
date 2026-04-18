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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkAssignHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const bulk_assign_command_1 = require("./bulk-assign.command");
const ownership_core_service_1 = require("../../../services/ownership-core.service");
let BulkAssignHandler = class BulkAssignHandler {
    constructor(ownershipCore) {
        this.ownershipCore = ownershipCore;
    }
    async execute(command) {
        let success = 0;
        let failed = 0;
        const errors = [];
        for (const entityId of command.entityIds) {
            try {
                await this.ownershipCore.assign({
                    entityType: command.entityType, entityId,
                    userId: command.userId, ownerType: command.ownerType,
                    assignedById: command.assignedById, reason: command.reason,
                    method: 'MANUAL',
                });
                success++;
            }
            catch (err) {
                failed++;
                errors.push({ entityId, error: err.message });
            }
        }
        return { success, failed, errors, total: command.entityIds.length };
    }
};
exports.BulkAssignHandler = BulkAssignHandler;
exports.BulkAssignHandler = BulkAssignHandler = __decorate([
    (0, cqrs_1.CommandHandler)(bulk_assign_command_1.BulkAssignCommand),
    __metadata("design:paramtypes", [ownership_core_service_1.OwnershipCoreService])
], BulkAssignHandler);
//# sourceMappingURL=bulk-assign.handler.js.map