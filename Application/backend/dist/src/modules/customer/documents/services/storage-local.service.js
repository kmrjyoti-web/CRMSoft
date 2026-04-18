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
exports.StorageLocalService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const uuid_1 = require("uuid");
let StorageLocalService = class StorageLocalService {
    constructor() {
        this.maxFileSize = 50 * 1024 * 1024;
        this.allowedMimeTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
            'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain', 'text/csv',
            'application/zip', 'application/x-rar-compressed',
            'video/mp4', 'video/mpeg', 'audio/mpeg', 'audio/wav',
        ];
        this.uploadDir = path.resolve(process.cwd(), 'uploads', 'documents');
        this.ensureDirectory(this.uploadDir);
    }
    async saveFile(file) {
        this.validateFile(file);
        const dateFolder = new Date().toISOString().slice(0, 7);
        const dirPath = path.join(this.uploadDir, dateFolder);
        this.ensureDirectory(dirPath);
        const ext = path.extname(file.originalname);
        const uniqueName = `${(0, uuid_1.v4)()}${ext}`;
        const filePath = path.join(dirPath, uniqueName);
        const relativePath = path.join('uploads', 'documents', dateFolder, uniqueName);
        fs.writeFileSync(filePath, file.buffer);
        return {
            fileName: uniqueName,
            originalName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size,
            storagePath: relativePath,
        };
    }
    async deleteFile(storagePath) {
        const fullPath = path.resolve(process.cwd(), storagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
    async getFile(storagePath) {
        const fullPath = path.resolve(process.cwd(), storagePath);
        if (!fs.existsSync(fullPath)) {
            throw new common_1.BadRequestException('File not found on disk');
        }
        const buffer = fs.readFileSync(fullPath);
        const fileName = path.basename(storagePath);
        return { buffer, fileName };
    }
    getFullPath(storagePath) {
        return path.resolve(process.cwd(), storagePath);
    }
    validateFile(file) {
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException(`File size exceeds limit of ${this.maxFileSize / (1024 * 1024)} MB`);
        }
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed`);
        }
    }
    ensureDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
};
exports.StorageLocalService = StorageLocalService;
exports.StorageLocalService = StorageLocalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], StorageLocalService);
//# sourceMappingURL=storage-local.service.js.map