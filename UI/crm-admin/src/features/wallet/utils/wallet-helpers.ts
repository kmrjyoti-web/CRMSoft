export { formatCurrency } from "@/lib/format-currency";
import type { WalletTxnType } from '../types/wallet.types';

export function formatTokens(tokens: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.abs(tokens));
}

export function tokensToAmount(tokens: number, tokenRate = 100): string {
  const amount = Math.abs(tokens) / tokenRate;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}


export const TXN_TYPE_COLORS: Record<WalletTxnType, string> = {
  CREDIT: 'text-green-600 bg-green-50',
  DEBIT: 'text-red-600 bg-red-50',
  REFUND: 'text-blue-600 bg-blue-50',
  PROMO: 'text-purple-600 bg-purple-50',
  ADJUSTMENT: 'text-amber-600 bg-amber-50',
  EXPIRY: 'text-gray-600 bg-gray-50',
};

export const TXN_TYPE_ICONS: Record<WalletTxnType, string> = {
  CREDIT: 'arrow-up',
  DEBIT: 'arrow-down',
  REFUND: 'rotate-ccw',
  PROMO: 'tag',
  ADJUSTMENT: 'sliders',
  EXPIRY: 'clock',
};

export const TXN_TYPE_LABELS: Record<WalletTxnType, string> = {
  CREDIT: 'Credit',
  DEBIT: 'Debit',
  REFUND: 'Refund',
  PROMO: 'Promo',
  ADJUSTMENT: 'Adjustment',
  EXPIRY: 'Expiry',
};

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
