import apiClient from '@/services/api-client';

import { cronConfigService } from '../cron-config.service';

jest.mock('@/services/api-client', () => {
  const mock = {
    get: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    post: jest.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    put: jest.fn().mockResolvedValue({ data: { success: true, data: {} } }),
  };
  return { __esModule: true, default: mock, api: mock };
});

beforeEach(() => jest.clearAllMocks());

describe('cronConfigService', () => {
  it('has all service methods', () => {
    expect(cronConfigService.listJobs).toBeDefined();
    expect(cronConfigService.getJob).toBeDefined();
    expect(cronConfigService.updateJob).toBeDefined();
    expect(cronConfigService.toggleJob).toBeDefined();
    expect(cronConfigService.runJob).toBeDefined();
    expect(cronConfigService.reloadJobs).toBeDefined();
    expect(cronConfigService.updateParams).toBeDefined();
    expect(cronConfigService.getHistory).toBeDefined();
    expect(cronConfigService.getDashboard).toBeDefined();
  });

  it('listJobs calls GET /admin/cron/jobs with params', async () => {
    await cronConfigService.listJobs({ status: 'ACTIVE', search: 'sync' });
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/cron/jobs', {
      params: { status: 'ACTIVE', search: 'sync' },
    });
  });

  it('getJob calls GET /admin/cron/jobs/:jobCode', async () => {
    await cronConfigService.getJob('lead-sync');
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/cron/jobs/lead-sync');
  });

  it('updateJob calls PUT /admin/cron/jobs/:jobCode', async () => {
    const payload = { cronExpression: '0 */2 * * *', timeoutSeconds: 600 };
    await cronConfigService.updateJob('lead-sync', payload);
    expect(apiClient.put).toHaveBeenCalledWith(
      '/api/v1/admin/cron/jobs/lead-sync',
      payload,
    );
  });

  it('toggleJob calls POST /admin/cron/jobs/:jobCode/toggle', async () => {
    await cronConfigService.toggleJob('lead-sync', { status: 'PAUSED' });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/v1/admin/cron/jobs/lead-sync/toggle',
      { status: 'PAUSED' },
    );
  });

  it('runJob calls POST /admin/cron/jobs/:jobCode/run', async () => {
    await cronConfigService.runJob('lead-sync');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/v1/admin/cron/jobs/lead-sync/run',
    );
  });

  it('reloadJobs calls POST /admin/cron/jobs/reload', async () => {
    await cronConfigService.reloadJobs();
    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/admin/cron/jobs/reload');
  });

  it('updateParams calls PUT /admin/cron/jobs/:jobCode/params', async () => {
    const payload = { jobParams: { batchSize: 50 } };
    await cronConfigService.updateParams('lead-sync', payload);
    expect(apiClient.put).toHaveBeenCalledWith(
      '/api/v1/admin/cron/jobs/lead-sync/params',
      payload,
    );
  });

  it('getHistory calls GET /admin/cron/jobs/:jobCode/history', async () => {
    await cronConfigService.getHistory('lead-sync', { page: 1, limit: 20 });
    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/v1/admin/cron/jobs/lead-sync/history',
      { params: { page: 1, limit: 20 } },
    );
  });

  it('getDashboard calls GET /admin/cron/dashboard', async () => {
    await cronConfigService.getDashboard();
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/cron/dashboard');
  });
});
