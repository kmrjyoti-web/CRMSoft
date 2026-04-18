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
var GetScreenshotUploadUrlHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetScreenshotUploadUrlHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const r2_storage_service_1 = require("../../../infrastructure/services/r2-storage.service");
const get_screenshot_upload_url_command_1 = require("./get-screenshot-upload-url.command");
let GetScreenshotUploadUrlHandler = GetScreenshotUploadUrlHandler_1 = class GetScreenshotUploadUrlHandler {
    constructor(r2) {
        this.r2 = r2;
        this.logger = new common_1.Logger(GetScreenshotUploadUrlHandler_1.name);
    }
    async execute(cmd) {
        try {
            const { tenantId, contentType, filename } = cmd;
            const key = this.r2.buildScreenshotKey(tenantId, filename);
            return this.r2.getPresignedUploadUrl(key, contentType);
        }
        catch (error) {
            this.logger.error(`GetScreenshotUploadUrlHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetScreenshotUploadUrlHandler = GetScreenshotUploadUrlHandler;
exports.GetScreenshotUploadUrlHandler = GetScreenshotUploadUrlHandler = GetScreenshotUploadUrlHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(get_screenshot_upload_url_command_1.GetScreenshotUploadUrlCommand),
    __metadata("design:paramtypes", [r2_storage_service_1.R2StorageService])
], GetScreenshotUploadUrlHandler);
//# sourceMappingURL=get-screenshot-upload-url.handler.js.map