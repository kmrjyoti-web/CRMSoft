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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = class AuthService {
    prisma;
    jwt;
    config;
    adminEmail;
    adminPasswordHash;
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.adminEmail = this.config.get('ADMIN_EMAIL', 'admin@crmsoft.in');
        const raw = this.config.get('ADMIN_PASSWORD', 'SuperAdmin@123');
        this.adminPasswordHash = bcrypt.hashSync(raw, 10);
    }
    async adminLogin(email, password) {
        if (email !== this.adminEmail)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const envPassword = this.config.get('ADMIN_PASSWORD', 'SuperAdmin@123');
        if (password !== envPassword)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const token = this.jwt.sign({ sub: 'master-admin', email, role: 'MASTER_ADMIN' });
        return { accessToken: token, role: 'MASTER_ADMIN', email };
    }
    async partnerLogin(email, password) {
        const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { email } });
        if (!partner)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const valid = await bcrypt.compare(password, partner.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const token = this.jwt.sign({
            sub: partner.id,
            email: partner.email,
            role: 'PARTNER',
            partnerId: partner.id,
            partnerCode: partner.partnerCode,
        });
        return { accessToken: token, role: 'PARTNER', partnerId: partner.id, partnerCode: partner.partnerCode };
    }
    async getMe(user) {
        if (user.role === 'MASTER_ADMIN')
            return { role: 'MASTER_ADMIN', email: user.email };
        const partner = await this.prisma.whiteLabelPartner.findUnique({
            where: { id: user.partnerId },
            include: { branding: true },
        });
        if (!partner)
            throw new common_1.UnauthorizedException();
        const { passwordHash, ...safe } = partner;
        return safe;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map