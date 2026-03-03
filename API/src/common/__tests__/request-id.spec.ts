import { RequestIdMiddleware } from '../request/request-id.middleware';

describe('RequestIdMiddleware', () => {
  const middleware = new RequestIdMiddleware();

  it('should generate a requestId when none provided', () => {
    const req = { headers: {} } as any;
    const res = { setHeader: jest.fn() } as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.requestId).toBeDefined();
    expect(req.requestId).toMatch(/^req_/);
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', req.requestId);
    expect(next).toHaveBeenCalled();
  });

  it('should use existing X-Request-Id header if provided', () => {
    const req = { headers: { 'x-request-id': 'custom-req-id' } } as any;
    const res = { setHeader: jest.fn() } as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.requestId).toBe('custom-req-id');
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', 'custom-req-id');
  });
});
