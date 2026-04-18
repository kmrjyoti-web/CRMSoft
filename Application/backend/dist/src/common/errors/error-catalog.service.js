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
exports.ErrorCatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const error_utils_1 = require("../utils/error.utils");
const CACHE_TTL_MS = 5 * 60 * 1000;
let ErrorCatalogService = class ErrorCatalogService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger('ErrorCatalog');
        this.cache = new Map();
        this.lastRefresh = 0;
    }
    async onModuleInit() {
        await this.refreshCache();
    }
    async getByCode(code) {
        await this.ensureFresh();
        return this.cache.get(code) ?? null;
    }
    async getAll() {
        await this.ensureFresh();
        return Array.from(this.cache.values());
    }
    async getByModule(moduleName) {
        await this.ensureFresh();
        return Array.from(this.cache.values()).filter((e) => e.module.toLowerCase() === moduleName.toLowerCase());
    }
    async getByLayer(layer) {
        await this.ensureFresh();
        return Array.from(this.cache.values()).filter((e) => e.layer === layer);
    }
    async refreshCache() {
        try {
            const entries = await this.prisma.platform.errorCatalog.findMany({
                where: { isActive: true },
            });
            this.cache.clear();
            for (const e of entries) {
                this.cache.set(e.code, {
                    code: e.code,
                    layer: e.layer,
                    module: e.module,
                    severity: e.severity,
                    httpStatus: e.httpStatus,
                    messageEn: e.messageEn,
                    messageHi: e.messageHi,
                    solutionEn: e.solutionEn,
                    solutionHi: e.solutionHi,
                    technicalInfo: e.technicalInfo,
                    helpUrl: e.helpUrl,
                    isRetryable: e.isRetryable,
                    retryAfterMs: e.retryAfterMs,
                });
            }
            this.lastRefresh = Date.now();
            this.logger.log(`Cache refreshed: ${this.cache.size} entries`);
            return this.cache.size;
        }
        catch (err) {
            this.logger.warn(`Cache refresh failed: ${(0, error_utils_1.getErrorMessage)(err)}`);
            return this.cache.size;
        }
    }
    async ensureFresh() {
        if (Date.now() - this.lastRefresh > CACHE_TTL_MS) {
            await this.refreshCache();
        }
    }
};
exports.ErrorCatalogService = ErrorCatalogService;
exports.ErrorCatalogService = ErrorCatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ErrorCatalogService);
//# sourceMappingURL=error-catalog.service.js.map