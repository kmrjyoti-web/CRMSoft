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
exports.WaWindowCheckerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let WaWindowCheckerService = class WaWindowCheckerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    isWindowOpen(windowExpiresAt) {
        if (!windowExpiresAt)
            return false;
        return new Date() < windowExpiresAt;
    }
    getWindowExpiry(windowExpiresAt) {
        if (!windowExpiresAt)
            return 0;
        const remaining = windowExpiresAt.getTime() - Date.now();
        return remaining > 0 ? remaining : 0;
    }
    async refreshWindow(conversationId) {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.prisma.working.waConversation.update({
            where: { id: conversationId },
            data: { windowExpiresAt: expiresAt, isWindowOpen: true },
        });
        return expiresAt;
    }
    async closeExpiredWindows() {
        const result = await this.prisma.working.waConversation.updateMany({
            where: { isWindowOpen: true, windowExpiresAt: { lt: new Date() } },
            data: { isWindowOpen: false },
        });
        return result.count;
    }
};
exports.WaWindowCheckerService = WaWindowCheckerService;
exports.WaWindowCheckerService = WaWindowCheckerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WaWindowCheckerService);
//# sourceMappingURL=wa-window-checker.service.js.map