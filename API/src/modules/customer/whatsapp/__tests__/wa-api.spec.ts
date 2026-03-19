import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { WaApiService } from '../services/wa-api.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

describe('WaApiService', () => {
  let service: WaApiService;
  let prisma: any;
  let httpService: any;

  const mockConfig = {
    id: 'waba-1',
    accessToken: 'test-access-token',
    phoneNumberId: '123456789',
    apiVersion: 'v17.0',
    wabaId: 'waba-ext-1',
  };

  const expectedBaseUrl = `https://graph.facebook.com/${mockConfig.apiVersion}/${mockConfig.phoneNumberId}/messages`;

  beforeEach(async () => {
    prisma = {
      whatsAppBusinessAccount: {
        findUniqueOrThrow: jest.fn().mockResolvedValue(mockConfig),
      },
    };

    httpService = {
      post: jest.fn().mockReturnValue(
        of({ data: { messages: [{ id: 'wamid.abc123' }] } }),
      ),
      get: jest.fn().mockReturnValue(of({ data: { data: [] } })),
      delete: jest.fn().mockReturnValue(of({ data: { success: true } })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaApiService,
        { provide: PrismaService, useValue: prisma },
        { provide: HttpService, useValue: httpService },
      ],
    }).compile();

    service = module.get<WaApiService>(WaApiService);
  });

  it('should send text message', async () => {
    const result = await service.sendText('waba-1', '919876543210', 'Hello there');

    expect(prisma.whatsAppBusinessAccount.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 'waba-1' },
    });
    expect(httpService.post).toHaveBeenCalledWith(
      expectedBaseUrl,
      {
        messaging_product: 'whatsapp',
        to: '919876543210',
        type: 'text',
        text: { body: 'Hello there' },
      },
      { headers: { Authorization: `Bearer ${mockConfig.accessToken}` } },
    );
    expect(result).toEqual({ messages: [{ id: 'wamid.abc123' }] });
  });

  it('should send template message', async () => {
    const components = [{ type: 'body', parameters: [{ type: 'text', text: 'John' }] }];

    await service.sendTemplate('waba-1', '919876543210', 'hello_world', 'en', components);

    expect(httpService.post).toHaveBeenCalledWith(
      expectedBaseUrl,
      expect.objectContaining({
        messaging_product: 'whatsapp',
        to: '919876543210',
        type: 'template',
        template: {
          name: 'hello_world',
          language: { code: 'en' },
          components,
        },
      }),
      expect.objectContaining({
        headers: { Authorization: `Bearer ${mockConfig.accessToken}` },
      }),
    );
  });

  it('should send media message', async () => {
    await service.sendMedia('waba-1', '919876543210', 'image', 'https://example.com/photo.jpg', 'A photo');

    expect(httpService.post).toHaveBeenCalledWith(
      expectedBaseUrl,
      expect.objectContaining({
        messaging_product: 'whatsapp',
        to: '919876543210',
        type: 'image',
        image: { link: 'https://example.com/photo.jpg', caption: 'A photo' },
      }),
      expect.objectContaining({
        headers: { Authorization: `Bearer ${mockConfig.accessToken}` },
      }),
    );
  });

  it('should mark message as read', async () => {
    await service.markAsRead('waba-1', 'wamid.xyz789');

    expect(httpService.post).toHaveBeenCalledWith(
      expectedBaseUrl,
      {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: 'wamid.xyz789',
      },
      { headers: { Authorization: `Bearer ${mockConfig.accessToken}` } },
    );
  });
});
