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
var OverdueCheckerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverdueCheckerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let OverdueCheckerService = OverdueCheckerService_1 = class OverdueCheckerService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(OverdueCheckerService_1.name);
    }
    async checkOverdueFollowUps() {
        const now = new Date();
        const result = await this.prisma.working.followUp.updateMany({
            where: {
                isActive: true,
                completedAt: null,
                isOverdue: false,
                dueDate: { lt: now },
                OR: [
                    { snoozedUntil: null },
                    { snoozedUntil: { lt: now } },
                ],
            },
            data: { isOverdue: true },
        });
        if (result.count > 0) {
            this.logger.log(`Marked ${result.count} follow-ups as overdue`);
        }
    }
};
exports.OverdueCheckerService = OverdueCheckerService;
exports.OverdueCheckerService = OverdueCheckerService = OverdueCheckerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OverdueCheckerService);
//# sourceMappingURL=overdue-checker.service.js.map