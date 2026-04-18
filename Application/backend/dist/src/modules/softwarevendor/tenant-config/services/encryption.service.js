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
exports.EncryptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let EncryptionService = class EncryptionService {
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        this.ALGORITHM = 'aes-256-gcm';
        this.IV_LENGTH = 16;
        this.AUTH_TAG_LENGTH = 16;
        const masterKey = this.config.get('ENCRYPTION_MASTER_KEY');
        if (!masterKey) {
            throw new Error('ENCRYPTION_MASTER_KEY is not set in environment');
        }
        this.key = crypto.scryptSync(masterKey, 'tenant-credential-salt', 32);
    }
    encrypt(data) {
        const plaintext = JSON.stringify(data);
        const iv = crypto.randomBytes(this.IV_LENGTH);
        const cipher = crypto.createCipheriv(this.ALGORITHM, this.key, iv);
        const encrypted = Buffer.concat([
            cipher.update(plaintext, 'utf8'),
            cipher.final(),
        ]);
        const authTag = cipher.getAuthTag();
        const combined = Buffer.concat([iv, authTag, encrypted]);
        return combined.toString('base64');
    }
    decrypt(encryptedString) {
        const combined = Buffer.from(encryptedString, 'base64');
        const iv = combined.subarray(0, this.IV_LENGTH);
        const authTag = combined.subarray(this.IV_LENGTH, this.IV_LENGTH + this.AUTH_TAG_LENGTH);
        const ciphertext = combined.subarray(this.IV_LENGTH + this.AUTH_TAG_LENGTH);
        const decipher = crypto.createDecipheriv(this.ALGORITHM, this.key, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([
            decipher.update(ciphertext),
            decipher.final(),
        ]);
        return JSON.parse(decrypted.toString('utf8'));
    }
    mask(value, showLast = 4) {
        if (!value)
            return '(not set)';
        if (value.includes('@') && !value.startsWith('http')) {
            const [local, domain] = value.split('@');
            const masked = local.length > 2
                ? local.substring(0, 2) + '***'
                : '***';
            return `${masked}@${domain}`;
        }
        if (value.startsWith('http://') || value.startsWith('https://')) {
            return value;
        }
        if (value.length <= showLast) {
            return '****';
        }
        const visible = value.substring(value.length - showLast);
        return `****${visible}`;
    }
    async rotateEncryptionKey(oldKey, newKey) {
        const oldDerivedKey = crypto.scryptSync(oldKey, 'tenant-credential-salt', 32);
        const newDerivedKey = crypto.scryptSync(newKey, 'tenant-credential-salt', 32);
        let rotated = 0;
        const credentials = await this.prisma.tenantCredential.findMany({
            select: { id: true, encryptedData: true },
        });
        for (const cred of credentials) {
            const decrypted = this.decryptWithKey(cred.encryptedData, oldDerivedKey);
            const reEncrypted = this.encryptWithKey(decrypted, newDerivedKey);
            await this.prisma.tenantCredential.update({
                where: { id: cred.id },
                data: { encryptedData: reEncrypted, encryptionVersion: { increment: 1 } },
            });
            rotated++;
        }
        const globals = await this.prisma.globalDefaultCredential.findMany({
            select: { id: true, encryptedData: true },
        });
        for (const g of globals) {
            const decrypted = this.decryptWithKey(g.encryptedData, oldDerivedKey);
            const reEncrypted = this.encryptWithKey(decrypted, newDerivedKey);
            await this.prisma.globalDefaultCredential.update({
                where: { id: g.id },
                data: { encryptedData: reEncrypted, encryptionVersion: { increment: 1 } },
            });
            rotated++;
        }
        return { rotated };
    }
    encryptWithKey(data, key) {
        const plaintext = JSON.stringify(data);
        const iv = crypto.randomBytes(this.IV_LENGTH);
        const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
        const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
        const authTag = cipher.getAuthTag();
        return Buffer.concat([iv, authTag, encrypted]).toString('base64');
    }
    decryptWithKey(encryptedString, key) {
        const combined = Buffer.from(encryptedString, 'base64');
        const iv = combined.subarray(0, this.IV_LENGTH);
        const authTag = combined.subarray(this.IV_LENGTH, this.IV_LENGTH + this.AUTH_TAG_LENGTH);
        const ciphertext = combined.subarray(this.IV_LENGTH + this.AUTH_TAG_LENGTH);
        const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        return JSON.parse(decrypted.toString('utf8'));
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], EncryptionService);
//# sourceMappingURL=encryption.service.js.map