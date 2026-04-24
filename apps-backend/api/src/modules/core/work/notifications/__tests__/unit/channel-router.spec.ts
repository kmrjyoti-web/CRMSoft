import { ChannelRouterService } from '../../services/channel-router.service';

describe('ChannelRouterService', () => {
  let service: ChannelRouterService;
  let prisma: any;
  let notificationCore: any;
  let templateService: any;
  let realtimeService: any;

  beforeEach(() => {
    prisma = {
      notificationPreference: { findUnique: jest.fn().mockResolvedValue(null) },
    };
    notificationCore = {
      create: jest.fn().mockResolvedValue({ id: 'n-1', category: 'LEAD_ASSIGNED', title: 'Test', status: 'UNREAD' }),
    };
    templateService = {
      render: jest.fn().mockResolvedValue({
        subject: 'Lead Assigned', body: 'Lead X assigned to you',
        category: 'LEAD_ASSIGNED', channels: ['IN_APP', 'EMAIL'],
      }),
    };
    realtimeService = { sendToUser: jest.fn() };
    service = new ChannelRouterService(prisma, notificationCore, templateService, realtimeService);
  });

  it('should route notification through template and create IN_APP', async () => {
    const result = await service.send({
      templateName: 'lead_assigned', recipientId: 'u-1', senderId: 'u-2',
      variables: { leadName: 'Test' },
    });
    expect(templateService.render).toHaveBeenCalledWith('lead_assigned', { leadName: 'Test' });
    expect(notificationCore.create).toHaveBeenCalled();
    expect(realtimeService.sendToUser).toHaveBeenCalledWith('u-1', expect.objectContaining({ type: 'notification' }));
    expect(result.channels.length).toBeGreaterThan(0);
  });

  it('should respect channel overrides', async () => {
    const result = await service.send({
      templateName: 'lead_assigned', recipientId: 'u-1',
      variables: {}, channelOverrides: ['IN_APP'],
    });
    // Only IN_APP should be processed, not EMAIL
    expect(result.channels).toEqual([{ channel: 'IN_APP', success: true }]);
  });

  it('should respect quiet hours — only IN_APP during quiet period', async () => {
    const now = new Date();
    const startHour = now.getHours();
    const endHour = (startHour + 2) % 24;
    prisma.notificationPreference.findUnique.mockResolvedValue({
      userId: 'u-1',
      quietHoursStart: `${String(startHour).padStart(2, '0')}:00`,
      quietHoursEnd: `${String(endHour).padStart(2, '0')}:00`,
      channels: { enabled: ['IN_APP', 'EMAIL', 'SMS'] },
      categories: {},
    });

    const result = await service.send({
      templateName: 'lead_assigned', recipientId: 'u-1', variables: {},
    });
    const channelNames = result.channels.map((c: any) => c.channel);
    expect(channelNames).toContain('IN_APP');
    expect(channelNames).not.toContain('EMAIL');
    expect(channelNames).not.toContain('SMS');
  });

  it('should use user preference channels when available', async () => {
    prisma.notificationPreference.findUnique.mockResolvedValue({
      userId: 'u-1', channels: { enabled: ['IN_APP', 'PUSH'] }, categories: {},
    });

    const result = await service.send({
      templateName: 'lead_assigned', recipientId: 'u-1', variables: {},
    });
    expect(result.channels.length).toBe(2);
  });
});
