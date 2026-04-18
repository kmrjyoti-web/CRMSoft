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
var WarningEvaluatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarningEvaluatorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let WarningEvaluatorService = WarningEvaluatorService_1 = class WarningEvaluatorService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(WarningEvaluatorService_1.name);
    }
    async evaluateWarnings(userId, deviceId) {
        const device = await this.prisma.working.syncDevice.findFirst({
            where: { userId, deviceId },
        });
        const rules = await this.prisma.working.syncWarningRule.findMany({
            where: { isEnabled: true },
            include: { policy: true },
            orderBy: { priority: 'asc' },
        });
        const warnings = [];
        const mustSyncEntities = [];
        let overallEnforcement = 'NONE';
        let blockDelayMinutes = null;
        const entitySyncState = device?.entitySyncState || {};
        const now = Date.now();
        for (const rule of rules) {
            if (rule.appliesToRoles.length > 0 || rule.appliesToUsers.length > 0) {
                if (rule.appliesToUsers.length > 0 && !rule.appliesToUsers.includes(userId))
                    continue;
            }
            const entityName = rule.policy?.entityName || null;
            let currentValue = 0;
            switch (rule.trigger) {
                case 'TIME_SINCE_SYNC': {
                    if (entityName) {
                        const state = entitySyncState[entityName];
                        const lastPulled = state?.lastPulledAt ? new Date(state.lastPulledAt).getTime() : 0;
                        currentValue = lastPulled ? (now - lastPulled) / 3600000 : 9999;
                    }
                    else {
                        const lastSync = device?.lastSyncAt?.getTime() || 0;
                        currentValue = lastSync ? (now - lastSync) / 3600000 : 9999;
                    }
                    break;
                }
                case 'DATA_AGE': {
                    if (entityName) {
                        const state = entitySyncState[entityName];
                        const lastPulled = state?.lastPulledAt ? new Date(state.lastPulledAt).getTime() : 0;
                        currentValue = lastPulled ? (now - lastPulled) / 86400000 : 9999;
                    }
                    else {
                        const lastSync = device?.lastSyncAt?.getTime() || 0;
                        currentValue = lastSync ? (now - lastSync) / 86400000 : 9999;
                    }
                    break;
                }
                case 'PENDING_UPLOAD_COUNT': {
                    currentValue = device?.pendingUploadCount || 0;
                    break;
                }
                case 'PENDING_UPLOAD_AGE': {
                    const oldestPending = device?.oldestPendingAt?.getTime() || 0;
                    currentValue = oldestPending ? (now - oldestPending) / 3600000 : 0;
                    break;
                }
                case 'STORAGE_SIZE': {
                    currentValue = device?.storageUsedMb ? Number(device.storageUsedMb) : 0;
                    break;
                }
                default:
                    continue;
            }
            const triggered = this.evaluateLevels(rule, currentValue);
            if (!triggered)
                continue;
            const warning = {
                ruleId: rule.id,
                ruleName: rule.name,
                entity: entityName,
                level: triggered.level,
                action: triggered.action,
                message: this.interpolateMessage(triggered.message, currentValue),
                delayMinutes: triggered.delayMinutes,
                currentValue: Math.round(currentValue * 100) / 100,
                threshold: Number(triggered.threshold),
                unit: rule.thresholdUnit,
            };
            warnings.push(warning);
            const enforcementPriority = this.getEnforcementPriority(triggered.action);
            const currentPriority = this.getEnforcementPriority(overallEnforcement);
            if (enforcementPriority > currentPriority) {
                overallEnforcement = triggered.action;
                blockDelayMinutes = triggered.delayMinutes ?? null;
            }
            if (triggered.action === 'BLOCK_UNTIL_SYNC' || triggered.action === 'FLUSH_AND_RESYNC') {
                if (entityName && !mustSyncEntities.includes(entityName)) {
                    mustSyncEntities.push(entityName);
                }
            }
        }
        const flushCommands = await this.getPendingFlushCommands(userId, deviceId);
        return {
            warnings,
            overallEnforcement,
            blockDelayMinutes,
            mustSyncEntities,
            flushCommands,
        };
    }
    evaluateLevels(rule, currentValue) {
        if (rule.level3Action && rule.level3Threshold != null && currentValue >= Number(rule.level3Threshold)) {
            return {
                level: 3,
                action: rule.level3Action,
                message: rule.level3Message || rule.name,
                threshold: Number(rule.level3Threshold),
            };
        }
        if (rule.level2Action && rule.level2Threshold != null && currentValue >= Number(rule.level2Threshold)) {
            return {
                level: 2,
                action: rule.level2Action,
                message: rule.level2Message || rule.name,
                threshold: Number(rule.level2Threshold),
                delayMinutes: rule.level2DelayMinutes,
            };
        }
        if (rule.level1Threshold != null && currentValue >= Number(rule.level1Threshold)) {
            return {
                level: 1,
                action: rule.level1Action,
                message: rule.level1Message || rule.name,
                threshold: Number(rule.level1Threshold),
            };
        }
        return null;
    }
    getEnforcementPriority(action) {
        switch (action) {
            case 'FLUSH_AND_RESYNC': return 4;
            case 'BLOCK_UNTIL_SYNC': return 3;
            case 'BLOCK_AFTER_DELAY': return 2;
            case 'WARN_ONLY': return 1;
            default: return 0;
        }
    }
    interpolateMessage(message, value) {
        return message
            .replace('{{value}}', String(Math.round(value * 10) / 10))
            .replace('{{days}}', String(Math.round(value)))
            .replace('{{hours}}', String(Math.round(value)));
    }
    async getPendingFlushCommands(userId, deviceId) {
        const commands = await this.prisma.working.syncFlushCommand.findMany({
            where: {
                status: 'PENDING',
                OR: [
                    { targetUserId: userId },
                    { targetDeviceId: deviceId },
                    { targetUserId: null, targetDeviceId: null },
                ],
            },
        });
        return commands.map((cmd) => ({
            flushId: cmd.id,
            flushType: cmd.flushType,
            targetEntity: cmd.targetEntity,
            reason: cmd.reason,
            redownloadAfter: cmd.redownloadAfter,
        }));
    }
};
exports.WarningEvaluatorService = WarningEvaluatorService;
exports.WarningEvaluatorService = WarningEvaluatorService = WarningEvaluatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WarningEvaluatorService);
//# sourceMappingURL=warning-evaluator.service.js.map