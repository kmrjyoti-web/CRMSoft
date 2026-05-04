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
exports.EncryptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
let EncryptionService = class EncryptionService {
    constructor(config) {
        this.config = config;
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
        const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
        const authTag = cipher.getAuthTag();
        return Buffer.concat([iv, authTag, encrypted]).toString('base64');
    }
    decrypt(encryptedString) {
        const combined = Buffer.from(encryptedString, 'base64');
        const iv = combined.subarray(0, this.IV_LENGTH);
        const authTag = combined.subarray(this.IV_LENGTH, this.IV_LENGTH + this.AUTH_TAG_LENGTH);
        const ciphertext = combined.subarray(this.IV_LENGTH + this.AUTH_TAG_LENGTH);
        const decipher = crypto.createDecipheriv(this.ALGORITHM, this.key, iv);
        decipher.setAuthTag(authTag);
        return JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8'));
    }
    mask(value, showLast = 4) {
        if (!value)
            return '(not set)';
        if (value.includes('@') && !value.startsWith('http')) {
            const [local, domain] = value.split('@');
            return `${local.length > 2 ? local.substring(0, 2) + '***' : '***'}@${domain}`;
        }
        if (value.startsWith('http://') || value.startsWith('https://'))
            return value;
        if (value.length <= showLast)
            return '****';
        return `****${value.substring(value.length - showLast)}`;
    }
    /** Rotate encryption key for a set of records. Pass prisma model references directly. */
    async rotateEncryptionKey(oldKey, newKey, storages) {
        const oldDerivedKey = crypto.scryptSync(oldKey, 'tenant-credential-salt', 32);
        const newDerivedKey = crypto.scryptSync(newKey, 'tenant-credential-salt', 32);
        let rotated = 0;
        for (const storage of storages) {
            const records = await storage.findMany({ select: { id: true, encryptedData: true } });
            for (const record of records) {
                const decrypted = this.decryptWithKey(record.encryptedData, oldDerivedKey);
                const reEncrypted = this.encryptWithKey(decrypted, newDerivedKey);
                await storage.update({ where: { id: record.id }, data: { encryptedData: reEncrypted, encryptionVersion: { increment: 1 } } });
                rotated++;
            }
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
        return JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8'));
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EncryptionService);
//# sourceMappingURL=encryption.service.js.map