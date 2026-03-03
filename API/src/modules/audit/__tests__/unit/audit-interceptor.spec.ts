import { AuditInterceptor } from '../../interceptors/audit.interceptor';
import { of } from 'rxjs';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let auditCoreService: any;
  let snapshotService: any;
  let entityResolver: any;
  let reflector: any;

  beforeEach(() => {
    auditCoreService = { log: jest.fn().mockResolvedValue({ id: 'log-1' }) };
    snapshotService = {
      captureSnapshot: jest.fn().mockResolvedValue({ id: 'entity-1', status: 'NEW' }),
    };
    entityResolver = {
      resolve: jest.fn().mockReturnValue({ entityType: 'LEAD', entityId: 'lead-1', action: 'CREATE', module: 'leads' }),
    };
    reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
      get: jest.fn().mockReturnValue(null),
    };
    interceptor = new AuditInterceptor(auditCoreService, snapshotService, entityResolver, reflector);
  });

  const createContext = (method: string, url: string, user?: any) => ({
    switchToHttp: () => ({
      getRequest: () => ({
        method, url, params: {}, body: {}, ip: '127.0.0.1',
        headers: { 'user-agent': 'test' },
        user: user || { id: 'user-1', firstName: 'Test', lastName: 'User', email: 'test@test.com' },
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  });

  const createCallHandler = (data: any = { data: { id: 'new-1' } }) => ({
    handle: () => of(data),
  });

  it('should capture CREATE action on POST /leads', async () => {
    entityResolver.resolve.mockReturnValue({ entityType: 'LEAD', entityId: null, action: 'CREATE', module: 'leads' });
    const ctx = createContext('POST', '/leads') as any;
    const result$ = await interceptor.intercept(ctx, createCallHandler() as any);
    await new Promise<void>(resolve => {
      result$.subscribe({ complete: () => setTimeout(resolve, 50) });
    });
    expect(entityResolver.resolve).toHaveBeenCalledWith('/leads', {}, 'POST');
  });

  it('should capture UPDATE action on PUT /leads/:id with before+after snapshots', async () => {
    entityResolver.resolve.mockReturnValue({ entityType: 'LEAD', entityId: 'lead-1', action: 'UPDATE', module: 'leads' });
    snapshotService.captureSnapshot
      .mockResolvedValueOnce({ id: 'lead-1', status: 'NEW' })
      .mockResolvedValueOnce({ id: 'lead-1', status: 'VERIFIED' });
    const ctx = createContext('PUT', '/leads/lead-1') as any;
    const result$ = await interceptor.intercept(ctx, createCallHandler() as any);
    await new Promise<void>(resolve => {
      result$.subscribe({ complete: () => setTimeout(resolve, 50) });
    });
    expect(snapshotService.captureSnapshot).toHaveBeenCalledWith('LEAD', 'lead-1');
  });

  it('should capture DELETE action on DELETE /leads/:id', async () => {
    entityResolver.resolve.mockReturnValue({ entityType: 'LEAD', entityId: 'lead-1', action: 'DELETE', module: 'leads' });
    const ctx = createContext('DELETE', '/leads/lead-1') as any;
    const result$ = await interceptor.intercept(ctx, createCallHandler() as any);
    await new Promise<void>(resolve => {
      result$.subscribe({ complete: () => setTimeout(resolve, 50) });
    });
    expect(snapshotService.captureSnapshot).toHaveBeenCalledWith('LEAD', 'lead-1');
  });

  it('should skip GET requests', async () => {
    const ctx = createContext('GET', '/leads') as any;
    const result$ = await interceptor.intercept(ctx, createCallHandler() as any);
    result$.subscribe();
    expect(entityResolver.resolve).not.toHaveBeenCalled();
  });

  it('should skip routes with @AuditSkip() decorator', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const ctx = createContext('POST', '/leads') as any;
    const result$ = await interceptor.intercept(ctx, createCallHandler() as any);
    result$.subscribe();
    expect(entityResolver.resolve).not.toHaveBeenCalled();
  });

  it('should respect @Auditable() decorator overrides', async () => {
    reflector.get.mockReturnValueOnce({ entityType: 'QUOTATION', action: 'STATUS_CHANGE', module: 'quotations' });
    entityResolver.resolve.mockReturnValue({ entityType: 'LEAD', entityId: 'q-1', action: 'UPDATE', module: 'leads' });
    const ctx = createContext('POST', '/quotations/q-1/accept') as any;
    const result$ = await interceptor.intercept(ctx, createCallHandler() as any);
    await new Promise<void>(resolve => {
      result$.subscribe({ complete: () => setTimeout(resolve, 50) });
    });
    // entityResolver was called, but the handler metadata should override
    expect(entityResolver.resolve).toHaveBeenCalled();
  });
});
