import { WebhookDispatcherService } from '../services/webhook-dispatcher.service';

const mockPrisma = {
  webhookDelivery: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  webhookEndpoint: {
    update: jest.fn(),
  },
} as any;

const mockWebhookService = {
  getActiveEndpointsForEvent: jest.fn(),
} as any;

const mockSigner = {
  sign: jest.fn().mockReturnValue('test-signature'),
} as any;

describe('WebhookDispatcherService', () => {
  let service: WebhookDispatcherService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WebhookDispatcherService(mockPrisma, mockWebhookService, mockSigner);
  });

  it('should skip dispatch if no active endpoints', async () => {
    mockWebhookService.getActiveEndpointsForEvent.mockResolvedValue([]);

    await service.dispatch('t1', 'lead.created', 'lead-1', { name: 'Test' });
    expect(mockPrisma.webhookDelivery.create).not.toHaveBeenCalled();
  });

  it('should create delivery record for each active endpoint', async () => {
    mockWebhookService.getActiveEndpointsForEvent.mockResolvedValue([
      { id: 'ep1', url: 'https://example.com/hook1', secret: 's1', maxRetries: 5 },
      { id: 'ep2', url: 'https://example.com/hook2', secret: 's2', maxRetries: 3 },
    ]);
    mockPrisma.webhookDelivery.create.mockResolvedValue({ id: 'd1' });

    // Mock global fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true, status: 200,
      text: () => Promise.resolve('ok'),
    });

    await service.dispatch('t1', 'lead.created', 'lead-1', { name: 'Test' });
    expect(mockPrisma.webhookDelivery.create).toHaveBeenCalledTimes(2);
  });

  it('should include signature in delivery payload', async () => {
    mockWebhookService.getActiveEndpointsForEvent.mockResolvedValue([
      { id: 'ep1', url: 'https://example.com/hook', secret: 's1', maxRetries: 5 },
    ]);
    mockPrisma.webhookDelivery.create.mockResolvedValue({ id: 'd1' });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true, status: 200,
      text: () => Promise.resolve('ok'),
    });

    await service.dispatch('t1', 'lead.created', 'lead-1', { name: 'Test' });
    expect(mockSigner.sign).toHaveBeenCalled();
    const createCall = mockPrisma.webhookDelivery.create.mock.calls[0][0];
    expect(createCall.data.signature).toBe('sha256=test-signature');
  });

  it('should return paginated deliveries', async () => {
    mockPrisma.webhookDelivery.findMany.mockResolvedValue([{ id: 'd1' }]);
    mockPrisma.webhookDelivery.count.mockResolvedValue(1);

    const result = await service.getDeliveries('t1', 'ep1', 1, 20);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
  });
});
