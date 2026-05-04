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
exports.R2StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let R2StorageService = class R2StorageService {
    constructor(config) {
        this.config = config;
        this.bucket = config.get('R2_BUCKET_NAME', 'crmsoft-marketplace');
        this.publicUrl = config.get('R2_PUBLIC_URL', '');
        this.s3 = new client_s3_1.S3Client({
            region: 'auto',
            endpoint: config.get('R2_ENDPOINT', ''),
            credentials: {
                accessKeyId: config.get('R2_ACCESS_KEY_ID', ''),
                secretAccessKey: config.get('R2_SECRET_ACCESS_KEY', ''),
            },
        });
    }
    async upload(params) {
        await this.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: params.key,
            Body: params.body,
            ContentType: params.contentType,
            Metadata: params.metadata,
        }));
        return `${this.publicUrl}/${params.key}`;
    }
    async getPresignedUploadUrl(key, contentType, expiresIn = 3600) {
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3, new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        }), { expiresIn });
    }
    async delete(key) {
        await this.s3.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    }
    generateKey(type, entityId, filename) {
        return `marketplace/${type}s/${entityId}/${Date.now()}-${filename}`;
    }
};
exports.R2StorageService = R2StorageService;
exports.R2StorageService = R2StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], R2StorageService);
//# sourceMappingURL=r2-storage.service.js.map