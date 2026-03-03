import { NotificationPrefService } from '../services/notification-pref.service';

const mockPrisma = {
  tenantNotificationSetting: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
} as any;

describe('NotificationPrefService', () => {
  let service: NotificationPrefService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationPrefService(mockPrisma);
  });

  it('should return event config with correct channels', async () => {
    mockPrisma.tenantNotificationSetting.findUnique.mockResolvedValue({
      eventCode: 'LEAD_ASSIGNED',
      inAppEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      whatsappEnabled: false,
      pushEnabled: false,
      notifyOwner: true,
    });

    const result = await service.getForEvent('t1', 'LEAD_ASSIGNED');
    expect(result).toBeDefined();
    expect(result!.inAppEnabled).toBe(true);
    expect(result!.emailEnabled).toBe(true);
    expect(result!.smsEnabled).toBe(false);
  });

  it('should update a single event channel toggle', async () => {
    mockPrisma.tenantNotificationSetting.update.mockResolvedValue({
      eventCode: 'LEAD_WON',
      emailEnabled: false,
    });

    const result = await service.update('t1', 'LEAD_WON', { emailEnabled: false });
    expect(mockPrisma.tenantNotificationSetting.update).toHaveBeenCalledWith({
      where: { tenantId_eventCode: { tenantId: 't1', eventCode: 'LEAD_WON' } },
      data: { emailEnabled: false },
    });
  });

  it('should group preferences by category', async () => {
    mockPrisma.tenantNotificationSetting.findMany.mockResolvedValue([
      { eventCode: 'LEAD_CREATED', eventCategory: 'LEAD' },
      { eventCode: 'LEAD_ASSIGNED', eventCategory: 'LEAD' },
      { eventCode: 'DEMO_SCHEDULED', eventCategory: 'DEMO' },
    ]);

    const grouped = await service.getAllGrouped('t1');
    expect(grouped['LEAD']).toHaveLength(2);
    expect(grouped['DEMO']).toHaveLength(1);
  });

  it('should send test notification and return active channels', async () => {
    mockPrisma.tenantNotificationSetting.findUnique.mockResolvedValue({
      inAppEnabled: true, emailEnabled: true, smsEnabled: false,
      whatsappEnabled: false, pushEnabled: true,
    });

    const result = await service.sendTest('t1', 'LEAD_WON');
    expect(result.sent).toBe(true);
    expect(result.channels).toEqual(['IN_APP', 'EMAIL', 'PUSH']);
  });
});
