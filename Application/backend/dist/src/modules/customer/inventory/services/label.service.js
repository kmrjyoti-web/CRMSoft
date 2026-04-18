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
exports.InventoryLabelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let InventoryLabelService = class InventoryLabelService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        return this.prisma.working.inventoryLabel.findMany({
            orderBy: { industryCode: 'asc' },
        });
    }
    async getByIndustry(industryCode) {
        return this.prisma.working.inventoryLabel.findUnique({
            where: { industryCode },
        });
    }
    async upsert(dto) {
        return this.prisma.working.inventoryLabel.upsert({
            where: { industryCode: dto.industryCode },
            create: dto,
            update: {
                serialNoLabel: dto.serialNoLabel,
                code1Label: dto.code1Label,
                code2Label: dto.code2Label,
                expiryLabel: dto.expiryLabel,
                stockInLabel: dto.stockInLabel,
                stockOutLabel: dto.stockOutLabel,
                locationLabel: dto.locationLabel,
            },
        });
    }
};
exports.InventoryLabelService = InventoryLabelService;
exports.InventoryLabelService = InventoryLabelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryLabelService);
//# sourceMappingURL=label.service.js.map