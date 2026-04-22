import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLeadsList, useCreateLead } from '../hooks/useLeads';
import { leadsService } from '../services/leads.service';

// Mock the leads service so we test hooks in isolation without real HTTP calls
jest.mock('../services/leads.service', () => ({
  leadsService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    quickCreate: jest.fn(),
    update: jest.fn(),
    changeStatus: jest.fn(),
    allocate: jest.fn(),
    getTransitions: jest.fn(),
    deactivate: jest.fn(),
    reactivate: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    permanentDelete: jest.fn(),
  },
}));

const mockLeadsService = leadsService as jest.Mocked<typeof leadsService>;

const mockLeadsData = {
  data: [
    {
      id: '1',
      leadNumber: 'L-001',
      firstName: 'Test',
      lastName: 'Lead',
      status: 'NEW' as const,
      priority: 'MEDIUM' as const,
      contactId: 'c-1',
      isActive: true,
      createdById: 'u-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contact: { id: 'c-1', firstName: 'Test', lastName: 'Lead' },
      validNextStatuses: ['VERIFIED'],
      isTerminal: false,
    },
    {
      id: '2',
      leadNumber: 'L-002',
      firstName: 'Another',
      lastName: 'Lead',
      status: 'CONTACTED' as const,
      priority: 'HIGH' as const,
      contactId: 'c-2',
      isActive: true,
      createdById: 'u-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contact: { id: 'c-2', firstName: 'Another', lastName: 'Lead' },
      validNextStatuses: [],
      isTerminal: false,
    },
  ],
  meta: { total: 2, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrevious: false },
  success: true,
  statusCode: 200,
  message: 'OK',
  timestamp: new Date().toISOString(),
  path: '/api/v1/leads',
  requestId: 'test-req-1',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockLeadsService.getAll.mockResolvedValue(mockLeadsData as any);
  mockLeadsService.create.mockResolvedValue({
    ...mockLeadsData,
    data: { id: '3', leadNumber: 'L-003', status: 'NEW', priority: 'MEDIUM', contactId: 'c-3', isActive: true, createdById: 'u-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), contact: { id: 'c-3', firstName: 'New', lastName: 'Lead' }, validNextStatuses: ['VERIFIED'], isTerminal: false },
  } as any);
});

describe('useLeadsList', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useLeadsList(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('returns data after successful fetch', async () => {
    const { result } = renderHook(() => useLeadsList(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(mockLeadsService.getAll).toHaveBeenCalledTimes(1);
  });

  it('accepts query params and passes them to service', async () => {
    const params = { page: 1, limit: 10, status: 'NEW' as const };
    const { result } = renderHook(
      () => useLeadsList(params),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockLeadsService.getAll).toHaveBeenCalledWith(params);
  });

  it('enters error state when service fails', async () => {
    const errorMessage = 'Network error';
    mockLeadsService.getAll.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useLeadsList(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});

describe('useCreateLead', () => {
  it('is in idle state initially', () => {
    const { result } = renderHook(() => useCreateLead(), { wrapper: createWrapper() });
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });
});
