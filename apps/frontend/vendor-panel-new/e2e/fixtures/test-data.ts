// ── Application URLs ──────────────────────────────────────
export const URLS = {
  login: '/login',
  dashboard: '/',
  tenants: '/tenants',
  modules: '/modules',
  packages: '/packages',
  support: '/support',
  settings: '/settings',
} as const;

// ── Test Credentials ──────────────────────────────────────
// Vendor Panel is vendor-only — use a vendor account (not CRM admin)
export const CREDENTIALS = {
  standard: {
    email: 'vendor@crmsoft.in',
    password: 'Vendor@123',
  },
  invalid: {
    email: 'notavendor@invalid.com',
    password: 'WrongPassword99',
  },
} as const;

// ── Timeouts ──────────────────────────────────────────────
export const TIMEOUTS = {
  /** Page navigation + React hydration */
  navigation: 20000,
  /** Network data fetch after page load */
  dataLoad: 15000,
  /** Short UI interaction (click, type) */
  interaction: 5000,
} as const;
