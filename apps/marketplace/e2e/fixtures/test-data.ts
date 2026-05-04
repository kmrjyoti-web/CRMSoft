// ── Application URLs (relative to basePath /marketplace) ──
export const URLS = {
  login: '/login',
  register: '/register',
  feed: '/feed',
  discover: '/discover',
  listings: '/listings',
  offers: '/offers',
  profile: '/profile',
} as const;

// ── Test Credentials ──────────────────────────────────────
export const CREDENTIALS = {
  standard: {
    email: 'buyer@testmarket.com',
    password: 'Market@123',
  },
  invalid: {
    email: 'nobody@invalid.com',
    password: 'WrongPass99',
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
