"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const slugify_1 = __importDefault(require("slugify"));
let PartnersService = class PartnersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateCode(companyName) {
        return (0, slugify_1.default)(companyName, { lower: true, strict: true }).substring(0, 20);
    }
    async create(dto) {
        const partnerCode = dto.partnerCode || this.generateCode(dto.companyName);
        const existing = await this.prisma.whiteLabelPartner.findFirst({ where: { OR: [{ email: dto.email }, { partnerCode }] } });
        if (existing)
            throw new common_1.ConflictException('Partner with this email or code already exists');
        const passwordHash = await bcrypt.hash(dto.password || 'Partner@123', 10);
        const trialExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const partner = await this.prisma.whiteLabelPartner.create({
            data: { ...dto, partnerCode, passwordHash, trialExpiresAt, password: undefined },
            include: { branding: true, domains: true },
        });
        const { passwordHash: _, ...safe } = partner;
        return safe;
    }
    async findAll(page = 1, limit = 20, search) {
        const skip = (page - 1) * limit;
        const where = search ? { OR: [{ companyName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } : {};
        const [data, total] = await Promise.all([
            this.prisma.whiteLabelPartner.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { branding: true, _count: { select: { domains: true } } } }),
            this.prisma.whiteLabelPartner.count({ where }),
        ]);
        return { data: data.map(({ passwordHash, ...p }) => p), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async findOne(id) {
        const partner = await this.prisma.whiteLabelPartner.findUnique({
            where: { id },
            include: { branding: true, domains: true, deployment: true, gitBranches: true, featureFlags: true },
        });
        if (!partner)
            throw new common_1.NotFoundException('Partner not found');
        const { passwordHash, ...safe } = partner;
        return safe;
    }
    async update(id, dto) {
        await this.findOne(id);
        const partner = await this.prisma.whiteLabelPartner.update({ where: { id }, data: dto, include: { branding: true } });
        const { passwordHash, ...safe } = partner;
        return safe;
    }
    async suspend(id, reason) {
        await this.findOne(id);
        const partner = await this.prisma.whiteLabelPartner.update({
            where: { id },
            data: { status: 'SUSPENDED', suspendedAt: new Date(), suspendedReason: reason },
        });
        const { passwordHash, ...safe } = partner;
        return safe;
    }
    async activate(id) {
        await this.findOne(id);
        const partner = await this.prisma.whiteLabelPartner.update({
            where: { id },
            data: { status: 'ACTIVE', suspendedAt: null, suspendedReason: null },
        });
        const { passwordHash, ...safe } = partner;
        return safe;
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.whiteLabelPartner.update({ where: { id }, data: { status: 'CANCELLED' } });
    }
    async getDashboard() {
        const [total, active, trial, suspended, cancelled] = await Promise.all([
            this.prisma.whiteLabelPartner.count(),
            this.prisma.whiteLabelPartner.count({ where: { status: 'ACTIVE' } }),
            this.prisma.whiteLabelPartner.count({ where: { status: 'TRIAL' } }),
            this.prisma.whiteLabelPartner.count({ where: { status: 'SUSPENDED' } }),
            this.prisma.whiteLabelPartner.count({ where: { status: 'CANCELLED' } }),
        ]);
        const recent = await this.prisma.whiteLabelPartner.findMany({
            take: 5, orderBy: { createdAt: 'desc' }, include: { branding: true },
        });
        return { stats: { total, active, trial, suspended, cancelled }, recentPartners: recent.map(({ passwordHash, ...p }) => p) };
    }
};
exports.PartnersService = PartnersService;
exports.PartnersService = PartnersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PartnersService);
//# sourceMappingURL=partners.service.js.map