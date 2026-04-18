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
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let WalletService = class WalletService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreate(tenantId) {
        let wallet = await this.prisma.wallet.findUnique({ where: { tenantId } });
        if (!wallet) {
            wallet = await this.prisma.wallet.create({
                data: {
                    tenantId,
                    balance: 0,
                    promoBalance: 0,
                    lifetimeCredit: 0,
                    lifetimeDebit: 0,
                    currency: 'INR',
                    tokenRate: 100,
                    isActive: true,
                },
            });
        }
        return wallet;
    }
    async getBalance(tenantId) {
        const wallet = await this.getOrCreate(tenantId);
        return {
            id: wallet.id,
            balance: wallet.balance,
            promoBalance: wallet.promoBalance,
            totalAvailable: wallet.balance + wallet.promoBalance,
            lifetimeCredit: wallet.lifetimeCredit,
            lifetimeDebit: wallet.lifetimeDebit,
            currency: wallet.currency,
            tokenRate: wallet.tokenRate,
            isActive: wallet.isActive,
        };
    }
    async ensureSufficientBalance(tenantId, tokens) {
        const wallet = await this.getOrCreate(tenantId);
        if (!wallet.isActive) {
            throw new common_1.BadRequestException('Wallet is inactive');
        }
        const totalAvailable = wallet.balance + wallet.promoBalance;
        if (totalAvailable < tokens) {
            throw new common_1.BadRequestException(`Insufficient wallet balance. Required: ${tokens} tokens, Available: ${totalAvailable} tokens`);
        }
        return wallet;
    }
    async activate(tenantId) {
        return this.prisma.wallet.update({
            where: { tenantId },
            data: { isActive: true },
        });
    }
    async deactivate(tenantId) {
        return this.prisma.wallet.update({
            where: { tenantId },
            data: { isActive: false },
        });
    }
    async findAll(params) {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 20;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.wallet.findMany({
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
            }),
            this.prisma.wallet.count(),
        ]);
        return { data, total, page, limit };
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map