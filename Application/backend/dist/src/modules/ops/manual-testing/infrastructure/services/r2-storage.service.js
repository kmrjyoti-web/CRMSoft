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
var R2StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.R2StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let R2StorageService = R2StorageService_1 = class R2StorageService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(R2StorageService_1.name);
        const accountId = this.config.get('R2_ACCOUNT_ID') ?? '';
        const accessKeyId = this.config.get('R2_ACCESS_KEY_ID') ?? '';
        const secretAccessKey = this.config.get('R2_SECRET_ACCESS_KEY') ?? '';
        this.bucket = this.config.get('R2_BUCKET_NAME') ?? 'crm-screenshots';
        this.publicBase = this.config.get('R2_PUBLIC_URL') ?? `https://${accountId}.r2.cloudflarestorage.com/${this.bucket}`;
        this.client = new client_s3_1.S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: { accessKeyId, secretAccessKey },
        });
    }
    async getPresignedUploadUrl(key, contentType, expiresInSeconds = 300) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn: expiresInSeconds });
        const publicUrl = `${this.publicBase}/${key}`;
        return { uploadUrl, publicUrl, key };
    }
    async deleteFile(key) {
        try {
            await this.client.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
        }
        catch (error) {
            this.logger.warn(`Failed to delete R2 object ${key}: ${error.message}`);
        }
    }
    buildScreenshotKey(tenantId, filename) {
        const date = new Date().toISOString().slice(0, 10);
        const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        return `manual-tests/${tenantId}/${date}/${Date.now()}_${sanitized}`;
    }
};
exports.R2StorageService = R2StorageService;
exports.R2StorageService = R2StorageService = R2StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], R2StorageService);
//# sourceMappingURL=r2-storage.service.js.map