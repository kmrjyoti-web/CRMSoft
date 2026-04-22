import apiClient from '@/services/api-client';

import { whatsappConfigService } from '../whatsapp-config.service';

jest.mock('@/services/api-client', () => {
  const mock = {
    get: jest.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    post: jest.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    put: jest.fn().mockResolvedValue({ data: { success: true, data: {} } }),
  };
  return { __esModule: true, default: mock, api: mock };
});

beforeEach(() => jest.clearAllMocks());

describe('whatsappConfigService', () => {
  it('has all service methods', () => {
    expect(whatsappConfigService.getConfig).toBeDefined();
    expect(whatsappConfigService.setup).toBeDefined();
    expect(whatsappConfigService.update).toBeDefined();
  });

  it('getConfig calls GET /whatsapp/waba/:id', async () => {
    await whatsappConfigService.getConfig('waba-123');
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/whatsapp/waba/waba-123');
  });

  it('setup calls POST /whatsapp/waba/setup', async () => {
    const payload = {
      wabaId: 'waba-id',
      phoneNumberId: 'phone-id',
      phoneNumber: '+919876543210',
      displayName: 'My Business',
      accessToken: 'token-abc',
      webhookVerifyToken: 'verify-123',
    };
    await whatsappConfigService.setup(payload);
    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/v1/whatsapp/waba/setup',
      payload,
    );
  });

  it('update calls PUT /whatsapp/waba/:id', async () => {
    const payload = { displayName: 'Updated Business' };
    await whatsappConfigService.update('waba-123', payload);
    expect(apiClient.put).toHaveBeenCalledWith(
      '/api/v1/whatsapp/waba/waba-123',
      payload,
    );
  });

  it('unwraps axios response data', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: { id: 'waba-1', wabaId: 'w-1' } },
    });
    const result = await whatsappConfigService.getConfig('waba-1');
    expect(result).toEqual({ success: true, data: { id: 'waba-1', wabaId: 'w-1' } });
  });
});
