import '@testing-library/jest-dom';

// ── MSW Server Lifecycle ─────────────────────────────────────────────────────
// Using require() so globals from jest.environment.js are applied before MSW loads.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { server } = require('./src/mocks/server') as { server: import('msw/node').SetupServer };

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Next.js Navigation Mocks ─────────────────────────────────────────────────
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// ── ResizeObserver Polyfill ──────────────────────────────────────────────────
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
