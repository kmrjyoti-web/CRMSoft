import { createTenantMiddleware } from '../infrastructure/prisma-tenant.middleware';
import { TenantContextService } from '../infrastructure/tenant-context.service';

function makeContext(tenantId?: string): TenantContextService {
  const svc = new TenantContextService();
  // Expose getTenantId as a jest mock returning the given value
  jest.spyOn(svc, 'getTenantId').mockReturnValue(tenantId);
  return svc;
}

function runMiddleware(
  tenantId: string | undefined,
  params: { model?: string; action: string; args?: any },
) {
  const ctx = makeContext(tenantId);
  const middleware = createTenantMiddleware(ctx);
  const next = jest.fn().mockResolvedValue({ id: 'row-1' });
  return { promise: middleware(params as any, next), next, params };
}

describe('createTenantMiddleware', () => {
  afterEach(() => jest.restoreAllMocks());

  describe('auto-filter on reads', () => {
    it('injects tenantId into findMany where clause', async () => {
      const params = { model: 'User', action: 'findMany', args: { where: { status: 'active' } } };
      const { promise, next } = runMiddleware('tenant-A', params);
      await promise;
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.objectContaining({ where: { status: 'active', tenantId: 'tenant-A' } }),
        }),
      );
    });

    it('injects tenantId into findFirst where clause', async () => {
      const params = { model: 'User', action: 'findFirst', args: { where: { email: 'x@example.com' } } };
      const { promise, next } = runMiddleware('tenant-A', params);
      await promise;
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-A' }) }),
        }),
      );
    });

    it('converts findUnique to findFirst and injects tenantId', async () => {
      const params = { model: 'User', action: 'findUnique', args: { where: { id: 'u-1' }, select: { id: true } } };
      const { promise, next } = runMiddleware('tenant-A', params);
      await promise;
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'findFirst',
          args: expect.objectContaining({ where: { id: 'u-1', tenantId: 'tenant-A' }, select: { id: true } }),
        }),
      );
    });
  });

  describe('auto-inject on writes', () => {
    it('injects tenantId into create data', async () => {
      const params = { model: 'User', action: 'create', args: { data: { email: 'a@b.com' } } };
      const { promise, next } = runMiddleware('tenant-B', params);
      await promise;
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          args: { data: { email: 'a@b.com', tenantId: 'tenant-B' } },
        }),
      );
    });

    it('injects tenantId into update where clause', async () => {
      const params = { model: 'User', action: 'update', args: { where: { id: 'u-1' }, data: { name: 'x' } } };
      const { promise, next } = runMiddleware('tenant-B', params);
      await promise;
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.objectContaining({ where: { id: 'u-1', tenantId: 'tenant-B' } }),
        }),
      );
    });

    it('injects tenantId into deleteMany where clause', async () => {
      const params = { model: 'User', action: 'deleteMany', args: { where: { status: 'inactive' } } };
      const { promise, next } = runMiddleware('tenant-B', params);
      await promise;
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          args: { where: { status: 'inactive', tenantId: 'tenant-B' } },
        }),
      );
    });
  });

  describe('cross-tenant protection', () => {
    it('logs CROSS_TENANT_ATTEMPT and overrides when caller passes a different tenantId', async () => {
      const logSpy = jest.spyOn(require('@nestjs/common').Logger.prototype, 'error').mockImplementation(() => {});
      const params = {
        model: 'User',
        action: 'findMany',
        args: { where: { tenantId: 'tenant-EVIL' } },
      };
      const { promise, next } = runMiddleware('tenant-A', params);
      await promise;
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('CROSS_TENANT_ATTEMPT'),
      );
      // The middleware must override with the context tenant, not the requested one
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.objectContaining({ where: { tenantId: 'tenant-A' } }),
        }),
      );
    });
  });

  describe('public endpoint passthrough (no tenant context)', () => {
    it('passes through without injecting tenantId when no context', async () => {
      const params = { model: 'User', action: 'findMany', args: { where: {} } };
      const { promise, next } = runMiddleware(undefined, params);
      await promise;
      // where should be unchanged (no tenantId added)
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          args: { where: {} },
        }),
      );
    });
  });

  describe('global model passthrough', () => {
    it('skips injection for GLOBAL_MODELS (Tenant)', async () => {
      const params = { model: 'Tenant', action: 'findMany', args: { where: {} } };
      const { promise, next } = runMiddleware('tenant-A', params);
      await promise;
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ args: { where: {} } }),
      );
    });

    it('skips injection for GLOBAL_MODELS (Plan)', async () => {
      const params = { model: 'Plan', action: 'findMany', args: { where: {} } };
      const { promise, next } = runMiddleware('tenant-A', params);
      await promise;
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ args: { where: {} } }),
      );
    });
  });

  describe('fail-closed via TenantContextService', () => {
    it('requireTenantId throws when no ALS context is set', () => {
      const svc = new TenantContextService();
      expect(() => svc.requireTenantId()).toThrow('Tenant context not set');
    });

    it('getTenantId returns undefined when no ALS context is set', () => {
      const svc = new TenantContextService();
      expect(svc.getTenantId()).toBeUndefined();
    });

    it('getTenantId returns value from ALS context', () => {
      const svc = new TenantContextService();
      let capturedId: string | undefined;
      svc.run({ tenantId: 'tenant-X' }, () => {
        capturedId = svc.getTenantId();
      });
      expect(capturedId).toBe('tenant-X');
    });
  });
});
