import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WaApiService {
  private readonly logger = new Logger(WaApiService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  private async getConfig(wabaId: string) {
    return this.prisma.whatsAppBusinessAccount.findUniqueOrThrow({ where: { id: wabaId } });
  }

  private baseUrl(apiVersion: string, phoneNumberId: string) {
    return `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
  }

  async sendText(wabaId: string, to: string, text: string): Promise<any> {
    const config = await this.getConfig(wabaId);
    const url = this.baseUrl(config.apiVersion, config.phoneNumberId);
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    };
    const { data } = await firstValueFrom(
      this.httpService.post(url, payload, {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      }),
    );
    return data;
  }

  async sendTemplate(wabaId: string, to: string, templateName: string, language: string, components?: any[]): Promise<any> {
    const config = await this.getConfig(wabaId);
    const url = this.baseUrl(config.apiVersion, config.phoneNumberId);
    const template: any = { name: templateName, language: { code: language } };
    if (components) template.components = components;
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template,
    };
    const { data } = await firstValueFrom(
      this.httpService.post(url, payload, {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      }),
    );
    return data;
  }

  async sendMedia(wabaId: string, to: string, type: string, mediaUrl: string, caption?: string): Promise<any> {
    const config = await this.getConfig(wabaId);
    const url = this.baseUrl(config.apiVersion, config.phoneNumberId);
    const mediaPayload: any = { link: mediaUrl };
    if (caption) mediaPayload.caption = caption;
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type,
      [type]: mediaPayload,
    };
    const { data } = await firstValueFrom(
      this.httpService.post(url, payload, {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      }),
    );
    return data;
  }

  async sendInteractive(wabaId: string, to: string, interactiveType: string, interactiveData: any): Promise<any> {
    const config = await this.getConfig(wabaId);
    const url = this.baseUrl(config.apiVersion, config.phoneNumberId);
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: { type: interactiveType, ...interactiveData },
    };
    const { data } = await firstValueFrom(
      this.httpService.post(url, payload, {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      }),
    );
    return data;
  }

  async sendLocation(wabaId: string, to: string, latitude: number, longitude: number, name?: string, address?: string): Promise<any> {
    const config = await this.getConfig(wabaId);
    const url = this.baseUrl(config.apiVersion, config.phoneNumberId);
    const location: any = { latitude, longitude };
    if (name) location.name = name;
    if (address) location.address = address;
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'location',
      location,
    };
    const { data } = await firstValueFrom(
      this.httpService.post(url, payload, {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      }),
    );
    return data;
  }

  async markAsRead(wabaId: string, waMessageId: string): Promise<void> {
    const config = await this.getConfig(wabaId);
    const url = this.baseUrl(config.apiVersion, config.phoneNumberId);
    await firstValueFrom(
      this.httpService.post(url, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: waMessageId,
      }, {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      }),
    );
  }

  async uploadMedia(wabaId: string, filePath: string, mimeType: string): Promise<string> {
    const config = await this.getConfig(wabaId);
    const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/media`;
    const FormData = (await import('form-data')).default;
    const fs = await import('fs');
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('type', mimeType);
    form.append('messaging_product', 'whatsapp');
    const { data } = await firstValueFrom(
      this.httpService.post(url, form, {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          ...form.getHeaders(),
        },
      }),
    );
    return data.id;
  }

  async downloadMedia(wabaId: string, mediaId: string): Promise<Buffer> {
    const config = await this.getConfig(wabaId);
    // First get the media URL
    const mediaUrl = `https://graph.facebook.com/${config.apiVersion}/${mediaId}`;
    const { data: mediaInfo } = await firstValueFrom(
      this.httpService.get(mediaUrl, {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      }),
    );
    // Then download the actual file
    const { data: fileData } = await firstValueFrom(
      this.httpService.get(mediaInfo.url, {
        headers: { Authorization: `Bearer ${config.accessToken}` },
        responseType: 'arraybuffer',
      }),
    );
    return Buffer.from(fileData);
  }

  async getTemplates(wabaId: string): Promise<any[]> {
    const config = await this.getConfig(wabaId);
    const url = `https://graph.facebook.com/${config.apiVersion}/${config.wabaId}/message_templates`;
    const { data } = await firstValueFrom(
      this.httpService.get(url, {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      }),
    );
    return data.data || [];
  }

  async createTemplate(wabaId: string, templateData: any): Promise<any> {
    const config = await this.getConfig(wabaId);
    const url = `https://graph.facebook.com/${config.apiVersion}/${config.wabaId}/message_templates`;
    const { data } = await firstValueFrom(
      this.httpService.post(url, templateData, {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      }),
    );
    return data;
  }

  async deleteTemplate(wabaId: string, templateName: string): Promise<void> {
    const config = await this.getConfig(wabaId);
    const url = `https://graph.facebook.com/${config.apiVersion}/${config.wabaId}/message_templates?name=${templateName}`;
    await firstValueFrom(
      this.httpService.delete(url, {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      }),
    );
  }
}
