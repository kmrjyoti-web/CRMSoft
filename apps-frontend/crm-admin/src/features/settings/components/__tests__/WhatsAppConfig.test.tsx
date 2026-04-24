import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

// AICTableFull uses motion/react which requires ResizeObserver + matchMedia
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

import { WhatsAppConfig } from '../WhatsAppConfig';

// ── Mocks ────────────────────────────────────────────────

jest.mock('../../hooks/useWhatsAppConfig', () => ({
  useWABAConfig: () => ({ data: null, isLoading: false }),
  useSetupWABA: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useUpdateWABA: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock('react-hot-toast', () => ({ success: jest.fn(), error: jest.fn() }));

jest.mock('@/hooks/useEntityPanel', () => ({
  useEntityPanel: () => ({ handleRowEdit: jest.fn(), handleCreate: jest.fn() }),
  useContentPanel: () => ({ openContent: jest.fn() }),
}));

jest.mock('@/stores/auth.store', () => ({
  useAuthStore: (sel: any) => sel({ roles: ['ADMIN'] }),
}));

function renderWithProvider(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

// ── Tests ────────────────────────────────────────────────

describe('WhatsAppConfig', () => {
  it('renders the page title', () => {
    renderWithProvider(<WhatsAppConfig />);
    expect(screen.getByText('WhatsApp Business API')).toBeInTheDocument();
  });

  it('shows setup mode when no config exists', () => {
    renderWithProvider(<WhatsAppConfig />);
    expect(screen.getByText('Setup WABA')).toBeInTheDocument();
  });

  it('renders all required form fields', () => {
    renderWithProvider(<WhatsAppConfig />);
    expect(screen.getByPlaceholderText('+919876543210')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('My Business')).toBeInTheDocument();
  });

  it('shows setup button', () => {
    renderWithProvider(<WhatsAppConfig />);
    expect(screen.getByText('Setup WhatsApp')).toBeInTheDocument();
  });
});
