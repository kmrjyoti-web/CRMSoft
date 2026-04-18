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
var WaMediaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaMediaService = void 0;
const common_1 = require("@nestjs/common");
const wa_api_service_1 = require("./wa-api.service");
const fs = require("fs");
const path = require("path");
let WaMediaService = WaMediaService_1 = class WaMediaService {
    constructor(waApiService) {
        this.waApiService = waApiService;
        this.logger = new common_1.Logger(WaMediaService_1.name);
        this.uploadDir = process.env.WA_MEDIA_UPLOAD_DIR || './uploads/whatsapp';
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async uploadToMeta(wabaId, filePath, mimeType) {
        return this.waApiService.uploadMedia(wabaId, filePath, mimeType);
    }
    async downloadAndSave(wabaId, mediaId, fileName) {
        const buffer = await this.waApiService.downloadMedia(wabaId, mediaId);
        const savePath = path.join(this.uploadDir, `${Date.now()}_${fileName}`);
        fs.writeFileSync(savePath, buffer);
        return savePath;
    }
    getMediaUrl(savedPath) {
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        const relativePath = savedPath.replace('./uploads/', '');
        return `${baseUrl}/uploads/${relativePath}`;
    }
};
exports.WaMediaService = WaMediaService;
exports.WaMediaService = WaMediaService = WaMediaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [wa_api_service_1.WaApiService])
], WaMediaService);
//# sourceMappingURL=wa-media.service.js.map