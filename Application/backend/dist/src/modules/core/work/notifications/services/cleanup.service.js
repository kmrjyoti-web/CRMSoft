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
var CleanupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let CleanupService = CleanupService_1 = class CleanupService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CleanupService_1.name);
    }
    async cleanupOldNotifications() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const archived = await this.prisma.notification.updateMany({
            where: {
                status: 'READ',
                isActive: true,
                readAt: { lt: thirtyDaysAgo },
            },
            data: { status: 'ARCHIVED', isActive: false },
        });
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const deleted = await this.prisma.notification.deleteMany({
            where: {
                status: { in: ['DISMISSED', 'ARCHIVED'] },
                updatedAt: { lt: ninetyDaysAgo },
            },
        });
        if (archived.count > 0 || deleted.count > 0) {
            this.logger.log(`Cleanup: archived ${archived.count} read, deleted ${deleted.count} old dismissed/archived`);
        }
    }
    async cleanupInactivePushSubscriptions() {
        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        const deleted = await this.prisma.pushSubscription.deleteMany({
            where: {
                isActive: false,
                updatedAt: { lt: sixtyDaysAgo },
            },
        });
        if (deleted.count > 0) {
            this.logger.log(`Cleaned up ${deleted.count} inactive push subscriptions`);
        }
    }
};
exports.CleanupService = CleanupService;
exports.CleanupService = CleanupService = CleanupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CleanupService);
//# sourceMappingURL=cleanup.service.js.map