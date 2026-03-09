import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false, media: query, onchange: null,
      addListener: jest.fn(), removeListener: jest.fn(),
      addEventListener: jest.fn(), removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

import { CronJobList } from '../CronJobList';

// ── Mock data ────────────────────────────────────────────

const mockJobs = [
  {
    id: 'job-1',
    jobCode: 'email-sync',
    jobName: 'Email Inbox Sync',
    description: 'Syncs email inboxes',
    moduleName: 'email',
    cronExpression: '*/5 * * * *',
    cronDescription: 'Every 5 minutes',
    timezone: 'Asia/Kolkata',
    scope: 'GLOBAL',
    status: 'ACTIVE',
    timeoutSeconds: 300,
    maxRetries: 2,
    retryDelaySeconds: 60,
    allowConcurrent: false,
    isRunning: false,
    lastRunAt: '2026-03-06T10:00:00Z',
    lastRunStatus: 'SUCCESS',
    lastRunDurationMs: 1500,
    nextRunAt: '2026-03-06T10:05:00Z',
    totalRunCount: 200,
    totalFailCount: 3,
    avgDurationMs: 1200,
    successRate: 98.5,
    alertOnFailure: true,
    alertOnTimeout: true,
    alertAfterConsecutiveFailures: 3,
    consecutiveFailures: 0,
    alertChannel: 'BOTH',
    alertRecipientEmails: [],
    alertRecipientUserIds: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-06T10:00:00Z',
  },
];

const mockDashboard = {
  totalJobs: 34,
  activeJobs: 30,
  pausedJobs: 4,
  failedLast24h: 2,
  avgDurationMs: 1500,
  successRate: 97.2,
};

jest.mock('../../hooks/useCronConfig', () => ({
  useCronJobs: () => ({ data: { data: mockJobs }, isLoading: false }),
  useCronDashboard: () => ({ data: { data: mockDashboard } }),
  useToggleCronJob: () => ({ mutateAsync: jest.fn() }),
  useRunCronJob: () => ({ mutateAsync: jest.fn() }),
  useReloadCrons: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useCronHistory: () => ({ data: { data: [] }, isLoading: false }),
  useCronJob: () => ({ data: null }),
  useUpdateCronJob: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock('react-hot-toast', () => ({ success: jest.fn(), error: jest.fn() }));

jest.mock('@/hooks/useEntityPanel', () => ({
  useEntityPanel: () => ({
    handleRowEdit: jest.fn(),
    handleCreate: jest.fn(),
  }),
  useContentPanel: () => ({ openContent: jest.fn() }),
}));

jest.mock('@/stores/auth.store', () => ({
  useAuthStore: (sel: any) => sel({ roles: ['ADMIN'] }),
}));

jest.mock('@/stores/side-panel.store', () => ({
  useSidePanelStore: (sel: any) => sel({ setFooterDisabled: jest.fn() }),
}));

function renderWithProvider(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

// ── Tests ────────────────────────────────────────────────

describe('CronJobList', () => {
  it('renders the table title', () => {
    renderWithProvider(<CronJobList />);
    expect(screen.getByText('Scheduled Jobs')).toBeInTheDocument();
  });

  it('shows dashboard cards', () => {
    renderWithProvider(<CronJobList />);
    expect(screen.getByText('Total Jobs')).toBeInTheDocument();
    expect(screen.getByText('34')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('displays job name in the table', () => {
    renderWithProvider(<CronJobList />);
    expect(screen.getByText('Email Inbox Sync')).toBeInTheDocument();
  });

  it('shows job code', () => {
    renderWithProvider(<CronJobList />);
    expect(screen.getByText('email-sync')).toBeInTheDocument();
  });

  it('shows reload all button', () => {
    renderWithProvider(<CronJobList />);
    expect(screen.getByText('Reload All')).toBeInTheDocument();
  });

  it('shows failed count in dashboard', () => {
    renderWithProvider(<CronJobList />);
    expect(screen.getByText('Failed (24h)')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
