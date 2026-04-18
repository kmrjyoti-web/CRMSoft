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
var MktPrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MktPrismaService = void 0;
const common_1 = require("@nestjs/common");
const marketplace_client_1 = require("@prisma/marketplace-client");
let MktPrismaService = MktPrismaService_1 = class MktPrismaService {
    constructor() {
        this.logger = new common_1.Logger(MktPrismaService_1.name);
        this._client = new marketplace_client_1.PrismaClient({
            log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
            datasources: {
                db: { url: process.env.MARKETPLACE_DATABASE_URL || process.env.DATABASE_URL || '' },
            },
        });
    }
    async onModuleInit() {
        try {
            await this._client.$connect();
            this.logger.log('MarketplaceDB connected');
        }
        catch (err) {
            this.logger.warn(`MarketplaceDB could not connect at startup — will retry on first query. ` +
                `Reason: ${err?.message ?? err}`);
        }
    }
    async onModuleDestroy() {
        await this._client.$disconnect();
        this.logger.log('MarketplaceDB disconnected');
    }
    get client() {
        return this._client;
    }
};
exports.MktPrismaService = MktPrismaService;
exports.MktPrismaService = MktPrismaService = MktPrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MktPrismaService);
//# sourceMappingURL=mkt-prisma.service.js.map