import { Test, TestingModule } from '@nestjs/testing';
import { WaTemplateService } from '../services/wa-template.service';
import { WaApiService } from '../services/wa-api.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

describe('WaTemplateService', () => {
  let service: WaTemplateService;
  let prisma: any;
  let waApiService: any;

  beforeEach(async () => {
    prisma = {
      waTemplate: {
        findFirst: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'tpl-local-1' }),
        update: jest.fn().mockResolvedValue({}),
      },
    };

    waApiService = {
      getTemplates: jest.fn().mockResolvedValue([]),
      createTemplate: jest.fn().mockResolvedValue({ id: 'meta-tpl-1' }),
      deleteTemplate: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaTemplateService,
        { provide: PrismaService, useValue: prisma },
        { provide: WaApiService, useValue: waApiService },
      ],
    }).compile();

    service = module.get<WaTemplateService>(WaTemplateService);
  });

  it('should sync templates from Meta', async () => {
    const metaTemplates = [
      {
        id: 'meta-1',
        name: 'hello_world',
        language: 'en',
        category: 'UTILITY',
        status: 'APPROVED',
        components: [
          { type: 'BODY', text: 'Hello {{1}}!' },
          { type: 'FOOTER', text: 'Powered by CRM' },
        ],
      },
      {
        id: 'meta-2',
        name: 'order_update',
        language: 'en',
        category: 'UTILITY',
        status: 'APPROVED',
        components: [
          { type: 'HEADER', format: 'TEXT', text: 'Order Update' },
          { type: 'BODY', text: 'Your order {{1}} has been shipped.' },
        ],
      },
    ];

    waApiService.getTemplates.mockResolvedValue(metaTemplates);
    // First template exists locally, second is new
    prisma.waTemplate.findFirst
      .mockResolvedValueOnce({ id: 'existing-tpl-1', metaTemplateId: 'meta-1' })
      .mockResolvedValueOnce(null);

    const result = await service.syncFromMeta('waba-1');

    expect(waApiService.getTemplates).toHaveBeenCalledWith('waba-1');
    expect(prisma.waTemplate.update).toHaveBeenCalledWith({
      where: { id: 'existing-tpl-1' },
      data: expect.objectContaining({
        name: 'hello_world',
        language: 'en',
        category: 'UTILITY',
        status: 'APPROVED',
        bodyText: 'Hello {{1}}!',
        footerText: 'Powered by CRM',
      }),
    });
    expect(prisma.waTemplate.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        wabaId: 'waba-1',
        metaTemplateId: 'meta-2',
        name: 'order_update',
        headerType: 'TEXT',
        headerContent: 'Order Update',
        bodyText: 'Your order {{1}} has been shipped.',
      }),
    });
    expect(result).toEqual({ synced: 2, added: 1, updated: 1 });
  });

  it('should create template on Meta', async () => {
    waApiService.createTemplate.mockResolvedValue({ id: 'meta-new-1' });
    prisma.waTemplate.create.mockResolvedValue({
      id: 'tpl-local-new',
      metaTemplateId: 'meta-new-1',
      name: 'welcome_msg',
    });

    const templateData = {
      name: 'welcome_msg',
      language: 'en',
      category: 'MARKETING',
      bodyText: 'Welcome {{1}} to our service!',
      footerText: 'Unsubscribe',
    };

    const result = await service.createOnMeta('waba-1', templateData);

    expect(waApiService.createTemplate).toHaveBeenCalledWith('waba-1', {
      name: 'welcome_msg',
      language: 'en',
      category: 'MARKETING',
      components: expect.arrayContaining([
        { type: 'BODY', text: 'Welcome {{1}} to our service!' },
        { type: 'FOOTER', text: 'Unsubscribe' },
      ]),
    });
    expect(prisma.waTemplate.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        wabaId: 'waba-1',
        metaTemplateId: 'meta-new-1',
        name: 'welcome_msg',
        language: 'en',
        category: 'MARKETING',
        status: 'PENDING',
        bodyText: 'Welcome {{1}} to our service!',
        footerText: 'Unsubscribe',
      }),
    });
    expect(result).toEqual({
      id: 'tpl-local-new',
      metaTemplateId: 'meta-new-1',
      name: 'welcome_msg',
    });
  });

  it('should delete template', async () => {
    const existingTemplate = {
      id: 'tpl-del-1',
      wabaId: 'waba-1',
      name: 'old_template',
      metaTemplateId: 'meta-del-1',
    };
    prisma.waTemplate.findUniqueOrThrow.mockResolvedValue(existingTemplate);

    await service.deleteOnMeta('tpl-del-1');

    expect(prisma.waTemplate.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 'tpl-del-1' },
    });
    expect(waApiService.deleteTemplate).toHaveBeenCalledWith('waba-1', 'old_template');
    expect(prisma.waTemplate.update).toHaveBeenCalledWith({
      where: { id: 'tpl-del-1' },
      data: { status: 'DELETED' },
    });
  });

  it('should handle empty template list', async () => {
    waApiService.getTemplates.mockResolvedValue([]);

    const result = await service.syncFromMeta('waba-1');

    expect(waApiService.getTemplates).toHaveBeenCalledWith('waba-1');
    expect(prisma.waTemplate.create).not.toHaveBeenCalled();
    expect(prisma.waTemplate.update).not.toHaveBeenCalled();
    expect(result).toEqual({ synced: 0, added: 0, updated: 0 });
  });
});
