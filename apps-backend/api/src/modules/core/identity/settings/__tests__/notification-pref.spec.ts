import { NotificationPrefService } from '../services/notification-pref.service';

const mockPrisma = {
  notificationConfig: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
} as any;
(mockPrisma as any).identity = mockPrisma;
(mockPrisma as any).platform = mockPrisma;

describe('NotificationPrefService', () => {
  let service: NotificationPrefService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationPrefService(mockPrisma);
  });

  it('should return event config with correct channels', async () => {
    mockPrisma.notificationConfig.findUnique.mockResolvedValue({
      eventCode: 'LEAD_ASSIGNED',
      enableInAppAlert: true,
      enableEmail: true,
      enableSms: false,
      enableWhatsapp: false,
      enablePush: false,
      notifyAssignee: true,
    });

    const result = await service.getForEvent('t1', 'LEAD_ASSIGNED');
    expect(result).toBeDefined();
    expect(result!.enableInAppAlert).toBe(true);
    expect(result!.enableEmail).toBe(true);
    expect(result!.enableSms).toBe(false);
  });

  it('should update a single event channel toggle', async () => {
    mockPrisma.notificationConfig.update.mockResolvedValue({
      eventCode: 'LEAD_WON',
      enableEmail: false,
    });

    const result = await service.update('t1', 'LEAD_WON', { enableEmail: false });
    expect(mockPrisma.notificationConfig.update).toHaveBeenCalledWith({
      where: { tenantId_eventCode: { tenantId: 't1', eventCode: 'LEAD_WON' } },
      data: { enableEmail: false },
    });
  });

  it('should group preferences by category', async () => {
    mockPrisma.notificationConfig.findMany.mockResolvedValue([
      { eventCode: 'LEAD_CREATED', eventCategory: 'LEAD' },
      { eventCode: 'LEAD_ASSIGNED', eventCategory: 'LEAD' },
      { eventCode: 'DEMO_SCHEDULED', eventCategory: 'DEMO' },
    ]);

    const grouped = await service.getAllGrouped('t1');
    expect(grouped['LEAD']).toHaveLength(2);
    expect(grouped['DEMO']).toHaveLength(1);
  });

  it('should send test notification and return active channels', async () => {
    mockPrisma.notificationConfig.findUnique.mockResolvedValue({
      enableInAppAlert: true, enableEmail: true, enableSms: false,
      enableWhatsapp: false, enablePush: true,
    });

    const result = await service.sendTest('t1', 'LEAD_WON');
    expect(result.sent).toBe(true);
    expect(result.channels).toEqual(['IN_APP', 'EMAIL', 'PUSH']);
  });

  describe('error cases', () => {
    it('should return null for unknown event code', async () => {
      mockPrisma.notificationConfig.findUnique.mockResolvedValue(null);
      const result = await service.getForEvent('t1', 'NON_EXISTENT_EVENT');
      expect(result).toBeNull();
    });

    it('should return empty object when no configs exist', async () => {
      mockPrisma.notificationConfig.findMany.mockResolvedValue([]);
      const grouped = await service.getAllGrouped('t1');
      expect(grouped).toEqual({});
    });

    it('should propagate DB error from notificationConfig.findUnique', async () => {
      mockPrisma.notificationConfig.findUnique.mockRejectedValue(new Error('DB timeout'));
      await expect(service.getForEvent('t1', 'LEAD_WON')).rejects.toThrow('DB timeout');
    });
  });
});
