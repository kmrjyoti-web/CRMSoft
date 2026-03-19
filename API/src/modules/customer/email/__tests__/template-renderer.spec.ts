import { Test, TestingModule } from '@nestjs/testing';
import { TemplateRendererService } from '../services/template-renderer.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

describe('TemplateRendererService', () => {
  let service: TemplateRendererService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      emailTemplate: {
        findUniqueOrThrow: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateRendererService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TemplateRendererService>(TemplateRendererService);
  });

  it('should render standard variables', () => {
    const template = 'Hello {{name}}, welcome to {{company}}!';
    const data = { name: 'Raj', company: 'Acme Corp' };

    const result = service.render(template, data);

    expect(result).toBe('Hello Raj, welcome to Acme Corp!');
  });

  it('should render nested path variables', () => {
    const template = 'Contact: {{user.profile.firstName}} from {{user.company.name}}';
    const data = {
      user: {
        profile: { firstName: 'Priya' },
        company: { name: 'TechCo' },
      },
    };

    const result = service.render(template, data);

    expect(result).toBe('Contact: Priya from TechCo');
  });

  it('should render fallback with missing value uses default', () => {
    const template = 'Hello {{fallback:nickname:Valued Customer}}, your plan is {{fallback:plan:Free}}.';
    const data = {};

    const result = service.render(template, data);

    expect(result).toBe('Hello Valued Customer, your plan is Free.');
  });

  it('should render conditional true and show content', () => {
    const template = 'Welcome!{{#if isPremium}} You have premium access.{{/if}} Enjoy.';
    const data = { isPremium: true };

    const result = service.render(template, data);

    expect(result).toBe('Welcome! You have premium access. Enjoy.');
  });

  it('should render conditional false and hide content', () => {
    const template = 'Welcome!{{#if isPremium}} You have premium access.{{/if}} Enjoy.';
    const data = { isPremium: false };

    const result = service.render(template, data);

    expect(result).toBe('Welcome! Enjoy.');
  });

  it('should extract variables from template', () => {
    const template = 'Hi {{name}}, your code is {{fallback:code:N/A}}. {{#if vip}}VIP!{{/if}} Visit {{website}}.';

    const variables = service.extractVariables(template);

    expect(variables).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'name', required: true }),
        expect.objectContaining({ name: 'code', required: false, defaultValue: 'N/A' }),
        expect.objectContaining({ name: 'vip', required: false }),
        expect.objectContaining({ name: 'website', required: true }),
      ]),
    );
    expect(variables.length).toBe(4);
  });
});
