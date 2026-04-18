"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudLinkParserService = void 0;
const common_1 = require("@nestjs/common");
const working_client_1 = require("@prisma/working-client");
let CloudLinkParserService = class CloudLinkParserService {
    constructor() {
        this.googleDrivePatterns = [
            /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
            /docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/,
            /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/,
            /docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/,
        ];
        this.oneDrivePatterns = [
            /onedrive\.live\.com\/.*[?&]id=([a-zA-Z0-9!%_-]+)/,
            /1drv\.ms\/([a-zA-Z0-9_-]+)/,
            /sharepoint\.com\/:([a-z]):\//,
        ];
        this.dropboxPatterns = [
            /dropbox\.com\/s\/([a-zA-Z0-9]+)\/([^?]+)/,
            /dropbox\.com\/scl\/fi\/([a-zA-Z0-9]+)\/([^?]+)/,
        ];
    }
    parseUrl(url) {
        for (const pattern of this.googleDrivePatterns) {
            const match = url.match(pattern);
            if (match) {
                return {
                    provider: working_client_1.StorageProvider.GOOGLE_DRIVE,
                    fileId: match[1],
                    url,
                };
            }
        }
        for (const pattern of this.oneDrivePatterns) {
            const match = url.match(pattern);
            if (match) {
                return {
                    provider: working_client_1.StorageProvider.ONEDRIVE,
                    fileId: match[1],
                    url,
                };
            }
        }
        for (const pattern of this.dropboxPatterns) {
            const match = url.match(pattern);
            if (match) {
                return {
                    provider: working_client_1.StorageProvider.DROPBOX,
                    fileId: match[1],
                    fileName: match[2] ? decodeURIComponent(match[2]) : undefined,
                    url,
                };
            }
        }
        return null;
    }
    detectProvider(url) {
        if (/google\.com|googleapis\.com/.test(url))
            return working_client_1.StorageProvider.GOOGLE_DRIVE;
        if (/onedrive|sharepoint|1drv\.ms/.test(url))
            return working_client_1.StorageProvider.ONEDRIVE;
        if (/dropbox\.com/.test(url))
            return working_client_1.StorageProvider.DROPBOX;
        return null;
    }
    isCloudUrl(url) {
        return this.detectProvider(url) !== null;
    }
    getMimeTypeFromExtension(fileName) {
        const ext = fileName.split('.').pop()?.toLowerCase();
        const mimeMap = {
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ppt: 'application/vnd.ms-powerpoint',
            pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            jpg: 'image/jpeg', jpeg: 'image/jpeg',
            png: 'image/png', gif: 'image/gif', webp: 'image/webp',
            mp4: 'video/mp4', mp3: 'audio/mpeg',
            txt: 'text/plain', csv: 'text/csv',
            zip: 'application/zip',
        };
        return mimeMap[ext || ''] || 'application/octet-stream';
    }
};
exports.CloudLinkParserService = CloudLinkParserService;
exports.CloudLinkParserService = CloudLinkParserService = __decorate([
    (0, common_1.Injectable)()
], CloudLinkParserService);
//# sourceMappingURL=cloud-link-parser.service.js.map