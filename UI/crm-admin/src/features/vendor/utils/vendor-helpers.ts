// ═══════════════════════════════════════════════════════════
// VENDOR HELPERS
// ═══════════════════════════════════════════════════════════

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

// ── License Status ───────────────────────────────────────────

export const LICENSE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  LIC_ACTIVE: { label: 'Active', color: 'success' },
  LIC_EXPIRED: { label: 'Expired', color: 'warning' },
  LIC_SUSPENDED: { label: 'Suspended', color: 'warning' },
  LIC_REVOKED: { label: 'Revoked', color: 'danger' },
};

// ── Offer Types ──────────────────────────────────────────────

export const OFFER_TYPE_MAP: Record<string, { label: string; icon: string }> = {
  TRIAL_EXTENSION: { label: 'Trial Extension', icon: 'clock' },
  DISCOUNT_PERCENTAGE: { label: 'Discount %', icon: 'percent' },
  DISCOUNT_FLAT: { label: 'Flat Discount', icon: 'indian-rupee' },
  BONUS_TOKENS: { label: 'Bonus Tokens', icon: 'zap' },
  FREE_UPGRADE: { label: 'Free Upgrade', icon: 'arrow-up' },
};

export const OFFER_TYPE_OPTIONS = [
  { value: 'TRIAL_EXTENSION', label: 'Trial Extension' },
  { value: 'DISCOUNT_PERCENTAGE', label: 'Discount %' },
  { value: 'DISCOUNT_FLAT', label: 'Flat Discount' },
  { value: 'BONUS_TOKENS', label: 'Bonus Tokens' },
  { value: 'FREE_UPGRADE', label: 'Free Upgrade' },
];

// ── Module Access ────────────────────────────────────────────

export const MODULE_ACCESS_OPTIONS = [
  { value: 'MOD_FULL', label: 'Full Access' },
  { value: 'MOD_READONLY', label: 'Read Only' },
  { value: 'MOD_DISABLED', label: 'Disabled' },
];

export const MODULE_CATEGORY_COLORS: Record<string, string> = {
  CRM: 'bg-blue-100 text-blue-700',
  SALES: 'bg-green-100 text-green-700',
  FINANCE: 'bg-yellow-100 text-yellow-700',
  POST_SALES: 'bg-purple-100 text-purple-700',
  COMMUNICATION: 'bg-pink-100 text-pink-700',
  AI: 'bg-indigo-100 text-indigo-700',
  REPORTS: 'bg-orange-100 text-orange-700',
  DEVELOPER: 'bg-gray-100 text-gray-700',
  WORKFLOW: 'bg-teal-100 text-teal-700',
};

// ── Display Helpers ──────────────────────────────────────────

export function getOfferValueDisplay(offer: { offerType: string; value: number }): string {
  switch (offer.offerType) {
    case 'TRIAL_EXTENSION':
      return `${offer.value} days`;
    case 'DISCOUNT_PERCENTAGE':
      return `${offer.value}%`;
    case 'DISCOUNT_FLAT':
      return formatCurrency(offer.value);
    case 'BONUS_TOKENS':
      return `${offer.value} tokens`;
    case 'FREE_UPGRADE':
      return 'Free';
    default:
      return String(offer.value);
  }
}

export const DB_STRATEGY_OPTIONS = [
  { value: 'SHARED', label: 'Shared Database' },
  { value: 'DEDICATED', label: 'Dedicated Database' },
];

export const LICENSE_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'LIC_ACTIVE', label: 'Active' },
  { value: 'LIC_EXPIRED', label: 'Expired' },
  { value: 'LIC_SUSPENDED', label: 'Suspended' },
  { value: 'LIC_REVOKED', label: 'Revoked' },
];
