// ── Test Lead ─────────────────────────────────────────────

export const TEST_LEAD = {
  name: 'E2E Test Lead',
  email: 'e2e-lead@testcompany.com',
  phone: '9876543210',
  source: 'WEBSITE',
} as const;

// ── Test Contact ──────────────────────────────────────────

export const TEST_CONTACT = {
  firstName: 'E2E',
  lastName: 'Contact',
  email: 'e2e-contact@testcompany.com',
  phone: '9876543211',
} as const;

// ── Test Quotation ────────────────────────────────────────

export const TEST_QUOTATION = {
  subject: 'E2E Test Quotation',
  validDays: '30',
} as const;

// ── Application URLs ──────────────────────────────────────

export const URLS = {
  login: '/login',
  dashboard: '/dashboard',
  leads: '/leads',
  contacts: '/contacts',
  organizations: '/organizations',
  quotations: '/quotations',
  settings: '/settings',
} as const;

// ── Test Credentials ──────────────────────────────────────

export const CREDENTIALS = {
  standard: {
    email: 'priya@sharmaenterprises.com',
    password: 'Test@123',
  },
  admin: {
    email: 'rajesh@sharmaenterprises.com',
    password: 'Test@123',
  },
  invalid: {
    email: 'nonexistent@invalid.com',
    password: 'WrongPassword99',
  },
} as const;

// ── Lead statuses (matches backend enum) ──────────────────

export const LEAD_STATUSES = [
  'NEW',
  'VERIFIED',
  'ALLOCATED',
  'IN_PROGRESS',
  'DEMO_SCHEDULED',
  'QUOTATION_SENT',
  'NEGOTIATION',
  'WON',
  'LOST',
  'ON_HOLD',
] as const;

// ── Timeouts ──────────────────────────────────────────────

export const TIMEOUTS = {
  /** Page navigation + React hydration */
  navigation: 20000,
  /** Network data fetch after page load */
  dataLoad: 15000,
  /** Short UI interaction (click, type) */
  interaction: 5000,
} as const;
