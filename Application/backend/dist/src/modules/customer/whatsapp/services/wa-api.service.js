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
var WaApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaApiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const rxjs_1 = require("rxjs");
let WaApiService = WaApiService_1 = class WaApiService {
    constructor(httpService, prisma) {
        this.httpService = httpService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(WaApiService_1.name);
    }
    async getConfig(wabaId) {
        return this.prisma.working.whatsAppBusinessAccount.findUniqueOrThrow({ where: { id: wabaId } });
    }
    baseUrl(apiVersion, phoneNumberId) {
        return `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
    }
    async sendText(wabaId, to, text) {
        const config = await this.getConfig(wabaId);
        const url = this.baseUrl(config.apiVersion, config.phoneNumberId);
        const payload = {
            messaging_product: 'whatsapp',
            to,
            type: 'text',
            text: { body: text },
        };
        const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, {
            headers: { Authorization: `Bearer ${config.accessToken}` },
        }));
        return data;
    }
    async sendTemplate(wabaId, to, templateName, language, components) {
        const config = await this.getConfig(wabaId);
        const url = this.baseUrl(config.apiVersion, config.phoneNumberId);
        const template = { name: templateName, language: { code: language } };
        if (components)
            template.components = components;
        const payload = {
            messaging_product: 'whatsapp',
            to,
            type: 'template',
            template,
        };
        const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, {
            headers: { Authorization: `Bearer ${config.accessToken}` },
        }));
        return data;
    }
    async sendMedia(wabaId, to, type, mediaUrl, caption) {
        const config = await this.getConfig(wabaId);
        const url = this.baseUrl(config.apiVersion, config.phoneNumberId);
        const mediaPayload = { link: mediaUrl };
        if (caption)
            mediaPayload.caption = caption;
        const payload = {
            messaging_product: 'whatsapp',
            to,
            type,
            [type]: mediaPayload,
        };
        const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, {
            headers: { Authorization: `Bearer ${config.accessToken}` },
        }));
        return data;
    }
    async sendInteractive(wabaId, to, interactiveType, interactiveData) {
        const config = await this.getConfig(wabaId);
        const url = this.baseUrl(config.apiVersion, config.phoneNumberId);
        const payload = {
            messaging_product: 'whatsapp',
            to,
            type: 'interactive',
            interactive: { type: interactiveType, ...interactiveData },
        };
        const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, {
            headers: { Authorization: `Bearer ${config.accessToken}` },
        }));
        return data;
    }
    async sendLocation(wabaId, to, latitude, longitude, name, address) {
        const config = await this.getConfig(wabaId);
        const url = this.baseUrl(config.apiVersion, config.phoneNumberId);
        const location = { latitude, longitude };
        if (name)
            location.name = name;
        if (address)
            location.address = address;
        const payload = {
            messaging_product: 'whatsapp',
            to,
            type: 'location',
            location,
        };
        const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, {
            headers: { Authorization: `Bearer ${config.accessToken}` },
        }));
        return data;
    }
    async markAsRead(wabaId, waMessageId) {
        const config = await this.getConfig(wabaId);
        const url = this.baseUrl(config.apiVersion, config.phoneNumberId);
        await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: waMessageId,
        }, {
            headers: { Authorization: `Bearer ${config.accessToken}` },
        }));
    }
    async uploadMedia(wabaId, filePath, mimeType) {
        const config = await this.getConfig(wabaId);
        const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/media`;
        const FormData = (await Promise.resolve().then(() => require('form-data'))).default;
        const fs = await Promise.resolve().then(() => require('fs'));
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        form.append('type', mimeType);
        form.append('messaging_product', 'whatsapp');
        const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, form, {
            headers: {
                Authorization: `Bearer ${config.accessToken}`,
                ...form.getHeaders(),
            },
        }));
        return data.id;
    }
    async downloadMedia(wabaId, mediaId) {
        const config = await this.getConfig(wabaId);
        const mediaUrl = `https://graph.facebook.com/${config.apiVersion}/${mediaId}`;
        const { data: mediaInfo } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(mediaUrl, {
            headers: { Authorization: `Bearer ${config.accessToken}` },
        }));
        const { data: fileData } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(mediaInfo.url, {
            headers: { Authorization: `Bearer ${config.accessToken}` },
            responseType: 'arraybuffer',
        }));
        return Buffer.from(fileData);
    }
    async getTemplates(wabaId) {
        const config = await this.getConfig(wabaId);
        const url = `https://graph.facebook.com/${config.apiVersion}/${config.wabaId}/message_templates`;
        const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
            headers: { Authorization: `Bearer ${config.accessToken}` },
        }));
        return data.data || [];
    }
    async createTemplate(wabaId, templateData) {
        const config = await this.getConfig(wabaId);
        const url = `https://graph.facebook.com/${config.apiVersion}/${config.wabaId}/message_templates`;
        const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, templateData, {
            headers: { Authorization: `Bearer ${config.accessToken}` },
        }));
        return data;
    }
    async deleteTemplate(wabaId, templateName) {
        const config = await this.getConfig(wabaId);
        const url = `https://graph.facebook.com/${config.apiVersion}/${config.wabaId}/message_templates?name=${templateName}`;
        await (0, rxjs_1.firstValueFrom)(this.httpService.delete(url, {
            headers: { Authorization: `Bearer ${config.accessToken}` },
        }));
    }
};
exports.WaApiService = WaApiService;
exports.WaApiService = WaApiService = WaApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        prisma_service_1.PrismaService])
], WaApiService);
//# sourceMappingURL=wa-api.service.js.map