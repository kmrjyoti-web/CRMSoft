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
exports.AiSettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let AiSettingsService = class AiSettingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async get(tenantId) {
        let settings = await this.prisma.aiSettings.findUnique({
            where: { tenantId },
        });
        if (!settings) {
            settings = await this.prisma.aiSettings.create({
                data: {
                    tenantId,
                    defaultProvider: 'ANTHROPIC_CLAUDE',
                    defaultModel: 'claude-sonnet-4-20250514',
                    isEnabled: true,
                },
            });
        }
        return settings;
    }
    async update(tenantId, data) {
        return this.prisma.aiSettings.upsert({
            where: { tenantId },
            create: {
                tenantId,
                ...data,
            },
            update: data,
        });
    }
};
exports.AiSettingsService = AiSettingsService;
exports.AiSettingsService = AiSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiSettingsService);
//# sourceMappingURL=ai-settings.service.js.map