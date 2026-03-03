import { ApiVersionMiddleware } from '../middleware/api-version.middleware';

describe('ApiVersionMiddleware', () => {
  let middleware: ApiVersionMiddleware;
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    middleware = new ApiVersionMiddleware();
    mockReq = { path: '/api/v1/leads', headers: {}, query: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should extract version from URL path', () => {
    middleware.use(mockReq, mockRes, mockNext);
    expect(mockReq.apiVersion).toBe('v1');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should prefer header over path', () => {
    mockReq.headers['x-api-version'] = 'v1';
    middleware.use(mockReq, mockRes, mockNext);
    expect(mockReq.apiVersion).toBe('v1');
  });

  it('should reject unsupported version', () => {
    mockReq.headers['x-api-version'] = 'v99';
    middleware.use(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should set X-Api-Version response header', () => {
    middleware.use(mockReq, mockRes, mockNext);
    expect(mockRes.setHeader).toHaveBeenCalledWith('X-Api-Version', 'v1');
  });

  it('should default to v1 when no version specified', () => {
    mockReq.path = '/some/other/path';
    middleware.use(mockReq, mockRes, mockNext);
    expect(mockReq.apiVersion).toBe('v1');
  });
});
