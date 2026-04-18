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
exports.GetCampaignDetailHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const query_1 = require("./query");
let GetCampaignDetailHandler = class GetCampaignDetailHandler {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(query) {
        const campaign = await this.prisma.working.emailCampaign.findUnique({
            where: { id: query.campaignId },
        });
        if (!campaign) {
            throw new common_1.NotFoundException(`Campaign ${query.campaignId} not found`);
        }
        return campaign;
    }
};
exports.GetCampaignDetailHandler = GetCampaignDetailHandler;
exports.GetCampaignDetailHandler = GetCampaignDetailHandler = __decorate([
    (0, cqrs_1.QueryHandler)(query_1.GetCampaignDetailQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetCampaignDetailHandler);
//# sourceMappingURL=handler.js.map