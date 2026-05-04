import { NotificationTemplateService } from '../../services/template.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('NotificationTemplateService', () => {
  let service: NotificationTemplateService;
  let prisma: any;

  const mockTemplate = {
    id: 't-1', name: 'lead_assigned', category: 'LEAD_ASSIGNED',
    subject: 'Lead {{leadName}} assigned to you',
    body: 'Hi {{userName}}, lead {{leadName}} from {{company}} has been assigned to you.',
    channels: ['IN_APP', 'EMAIL'], variables: ['leadName', 'userName', 'company'], isActive: true,
  };

  beforeEach(() => {
    prisma = {
      notificationTemplate: {
        findFirst: jest.fn().mockResolvedValue(mockTemplate),
        findMany: jest.fn().mockResolvedValue([mockTemplate]),
        create: jest.fn().mockResolvedValue(mockTemplate),
        update: jest.fn().mockResolvedValue(mockTemplate),
      },
    };
    service = new NotificationTemplateService(prisma);
  });

  it('should render template with variable interpolation', async () => {
    const result = await service.render('lead_assigned', {
      leadName: 'Acme Corp Deal', userName: 'Raj', company: 'Acme Corp',
    });
    expect(result.subject).toBe('Lead Acme Corp Deal assigned to you');
    expect(result.body).toContain('Hi Raj');
    expect(result.body).toContain('Acme Corp');
    expect(result.channels).toEqual(['IN_APP', 'EMAIL']);
  });

  it('should keep placeholder if variable not provided', async () => {
    const result = await service.render('lead_assigned', { leadName: 'Test' });
    expect(result.subject).toBe('Lead Test assigned to you');
    expect(result.body).toContain('{{userName}}');
  });

  it('should throw NotFoundException for missing template', async () => {
    prisma.notificationTemplate.findFirst.mockResolvedValue(null);
    await expect(service.render('nonexistent', {})).rejects.toThrow(NotFoundException);
  });

  it('should create a new template', async () => {
    prisma.notificationTemplate.findFirst.mockResolvedValue(null);
    const result = await service.create({
      name: 'new_template', category: 'SYSTEM_ALERT',
      subject: 'Alert: {{title}}', body: '{{message}}',
    });
    expect(prisma.notificationTemplate.create).toHaveBeenCalled();
  });

  it('should throw ConflictException for duplicate template name', async () => {
    await expect(service.create({
      name: 'lead_assigned', category: 'LEAD_ASSIGNED',
      subject: 'test', body: 'test',
    })).rejects.toThrow(ConflictException);
  });
});
