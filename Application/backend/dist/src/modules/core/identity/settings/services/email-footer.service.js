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
var EmailFooterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailFooterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const app_error_1 = require("../../../../../common/errors/app-error");
let EmailFooterService = EmailFooterService_1 = class EmailFooterService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(EmailFooterService_1.name);
    }
    async list(tenantId) {
        return this.prisma.emailFooterTemplate.findMany({
            where: { tenantId, isActive: true },
            orderBy: { isDefault: 'desc' },
        });
    }
    async create(tenantId, data) {
        if (data.isDefault) {
            await this.prisma.emailFooterTemplate.updateMany({
                where: { tenantId, isDefault: true },
                data: { isDefault: false },
            });
        }
        return this.prisma.emailFooterTemplate.create({
            data: { tenantId, ...data },
        });
    }
    async update(tenantId, id, data) {
        const footer = await this.prisma.emailFooterTemplate.findFirst({ where: { id, tenantId } });
        if (!footer)
            throw app_error_1.AppError.from('NOT_FOUND');
        if (data.isDefault) {
            await this.prisma.emailFooterTemplate.updateMany({
                where: { tenantId, isDefault: true, NOT: { id } },
                data: { isDefault: false },
            });
        }
        return this.prisma.emailFooterTemplate.update({ where: { id }, data });
    }
    async getDefault(tenantId) {
        return this.prisma.emailFooterTemplate.findFirst({
            where: { tenantId, isDefault: true, isActive: true },
        });
    }
};
exports.EmailFooterService = EmailFooterService;
exports.EmailFooterService = EmailFooterService = EmailFooterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmailFooterService);
//# sourceMappingURL=email-footer.service.js.map