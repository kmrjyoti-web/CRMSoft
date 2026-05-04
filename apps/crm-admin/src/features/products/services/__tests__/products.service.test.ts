import { packageService, unitService, productService } from '../products.service';

// Mock the API client
jest.mock('@/services/api-client', () => {
  const mockGet = jest.fn().mockResolvedValue({ data: {} });
  const mockPost = jest.fn().mockResolvedValue({ data: {} });
  const mockPut = jest.fn().mockResolvedValue({ data: {} });
  const mockDelete = jest.fn().mockResolvedValue({ data: {} });
  return {
    __esModule: true,
    default: { get: mockGet, post: mockPost, put: mockPut, delete: mockDelete },
    api: { get: mockGet, post: mockPost, put: mockPut, delete: mockDelete },
  };
});

import apiClient from '@/services/api-client';

const mockGet = apiClient.get as jest.Mock;
const mockPost = apiClient.post as jest.Mock;
const mockPut = apiClient.put as jest.Mock;
const mockDelete = apiClient.delete as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Package Service
// ---------------------------------------------------------------------------

describe('packageService', () => {
  it('should have getAll, getById, create, update, delete methods', () => {
    expect(typeof packageService.getAll).toBe('function');
    expect(typeof packageService.getById).toBe('function');
    expect(typeof packageService.create).toBe('function');
    expect(typeof packageService.update).toBe('function');
    expect(typeof packageService.delete).toBe('function');
  });

  it('getAll calls GET /packages with optional params', async () => {
    const params = { search: 'box' };
    await packageService.getAll(params as any);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/packages', { params });
  });

  it('getById calls GET /packages/:id', async () => {
    await packageService.getById('pkg-1');
    expect(mockGet).toHaveBeenCalledWith('/api/v1/packages/pkg-1');
  });

  it('create calls POST /packages with data', async () => {
    const data = { name: 'Box-100ml' };
    await packageService.create(data as any);
    expect(mockPost).toHaveBeenCalledWith('/api/v1/packages', data);
  });

  it('update calls PUT /packages/:id with data', async () => {
    const data = { name: 'Box-200ml' };
    await packageService.update('pkg-1', data as any);
    expect(mockPut).toHaveBeenCalledWith('/api/v1/packages/pkg-1', data);
  });

  it('delete calls DELETE /packages/:id', async () => {
    await packageService.delete('pkg-1');
    expect(mockDelete).toHaveBeenCalledWith('/api/v1/packages/pkg-1');
  });
});

// ---------------------------------------------------------------------------
// Unit Service
// ---------------------------------------------------------------------------

describe('unitService', () => {
  it('should have getTypes method', () => {
    expect(typeof unitService.getTypes).toBe('function');
  });

  it('getTypes calls GET /units/types', async () => {
    await unitService.getTypes();
    expect(mockGet).toHaveBeenCalledWith('/api/v1/units/types');
  });
});

// ---------------------------------------------------------------------------
// Product Service
// ---------------------------------------------------------------------------

describe('productService', () => {
  it('should have getAll, getById, create, update, deactivate methods', () => {
    expect(typeof productService.getAll).toBe('function');
    expect(typeof productService.getById).toBe('function');
    expect(typeof productService.create).toBe('function');
    expect(typeof productService.update).toBe('function');
    expect(typeof productService.deactivate).toBe('function');
  });

  it('getAll calls GET /products with optional params', async () => {
    const params = { page: 1, limit: 25, search: 'widget' };
    await productService.getAll(params as any);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/products', { params });
  });

  it('getById calls GET /products/:id', async () => {
    await productService.getById('prod-1');
    expect(mockGet).toHaveBeenCalledWith('/api/v1/products/prod-1');
  });

  it('create calls POST /products with data', async () => {
    const data = { name: 'Widget X', sku: 'WX-001' };
    await productService.create(data as any);
    expect(mockPost).toHaveBeenCalledWith('/api/v1/products', data);
  });

  it('update calls PUT /products/:id with data', async () => {
    const data = { name: 'Widget X v2' };
    await productService.update('prod-1', data as any);
    expect(mockPut).toHaveBeenCalledWith('/api/v1/products/prod-1', data);
  });

  it('deactivate calls POST /products/:id/deactivate', async () => {
    await productService.deactivate('prod-1');
    expect(mockPost).toHaveBeenCalledWith('/api/v1/products/prod-1/deactivate');
  });
});
