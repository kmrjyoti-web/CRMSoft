import apiClient from '@/services/api-client';

import { emailConfigService } from '../email-config.service';

jest.mock('@/services/api-client', () => {
  const mock = {
    get: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    post: jest.fn().mockResolvedValue({ data: { success: true, data: {} } }),
  };
  return { __esModule: true, default: mock, api: mock };
});

beforeEach(() => jest.clearAllMocks());

describe('emailConfigService', () => {
  it('has all service methods', () => {
    expect(emailConfigService.getAll).toBeDefined();
    expect(emailConfigService.getById).toBeDefined();
    expect(emailConfigService.connect).toBeDefined();
    expect(emailConfigService.disconnect).toBeDefined();
    expect(emailConfigService.sync).toBeDefined();
  });

  it('getAll calls GET /email-accounts', async () => {
    await emailConfigService.getAll();
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/email-accounts', {
      params: undefined,
    });
  });

  it('getById calls GET /email-accounts/:id', async () => {
    await emailConfigService.getById('acc-123');
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/email-accounts/acc-123');
  });

  it('connect calls POST /email-accounts/connect', async () => {
    const payload = {
      provider: 'GMAIL' as const,
      emailAddress: 'test@gmail.com',
      displayName: 'Test Account',
    };
    await emailConfigService.connect(payload);
    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/v1/email-accounts/connect',
      payload,
    );
  });

  it('disconnect calls POST /email-accounts/:id/disconnect', async () => {
    await emailConfigService.disconnect('acc-123');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/v1/email-accounts/acc-123/disconnect',
    );
  });

  it('sync calls POST /email-accounts/:id/sync', async () => {
    await emailConfigService.sync('acc-123');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/v1/email-accounts/acc-123/sync',
    );
  });

  it('connect with SMTP fields', async () => {
    const payload = {
      provider: 'IMAP_SMTP' as const,
      emailAddress: 'user@company.com',
      imapHost: 'imap.company.com',
      imapPort: 993,
      imapSecure: true,
      smtpHost: 'smtp.company.com',
      smtpPort: 587,
      smtpSecure: true,
      smtpUsername: 'user@company.com',
      smtpPassword: 'password123',
    };
    await emailConfigService.connect(payload);
    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/v1/email-accounts/connect',
      payload,
    );
  });
});
