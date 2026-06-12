export { formatCurrency } from "@/lib/format-currency";
import type { LimitType } from '../types/subscription.types';

export const RESOURCE_LABELS: Record<string, string> = {
  users: 'Users',
  contacts: 'Contacts',
  leads: 'Leads',
  products: 'Products',
  organizations: 'Organizations',
  invoices: 'Invoices',
  quotations: 'Quotations',
  activities: 'Activities',
  demos: 'Demos',
  tour_plans: 'Tour Plans',
  workflows: 'Workflows',
  documents: 'Documents',
  tickets: 'Tickets',
  installations: 'Installations',
  trainings: 'Trainings',
  storage_mb: 'Storage (MB)',
  api_calls_daily: 'API Calls / Day',
};

export const RESOURCE_ICONS: Record<string, string> = {
  users: 'users',
  contacts: 'contact',
  leads: 'target',
  products: 'package',
  organizations: 'building-2',
  invoices: 'file-text',
  quotations: 'file-check',
  activities: 'activity',
  demos: 'presentation',
  tour_plans: 'map-pin',
  workflows: 'git-branch',
  documents: 'file',
  tickets: 'ticket',
  installations: 'wrench',
  trainings: 'graduation-cap',
  storage_mb: 'hard-drive',
  api_calls_daily: 'zap',
};

export const ALL_RESOURCE_KEYS = Object.keys(RESOURCE_LABELS);

export const FEATURE_LABELS: Record<string, string> = {
  WHATSAPP_INTEGRATION: 'WhatsApp',
  EMAIL_INTEGRATION: 'Email',
  BULK_IMPORT: 'Bulk Import',
  BULK_EXPORT: 'Bulk Export',
  DOCUMENTS: 'Documents',
  WORKFLOWS: 'Workflows',
  QUOTATION_AI: 'Quotation AI',
  ADVANCED_REPORTS: 'Advanced Reports',
  CUSTOM_FIELDS: 'Custom Fields',
  API_ACCESS: 'API Access',
  QUOTATIONS: 'Quotations',
  INVOICES: 'Invoices',
  DEMOS: 'Demos',
  TOUR_PLANS: 'Tour Plans',
  ACTIVITIES: 'Activities',
  INSTALLATIONS: 'Installations',
  TRAININGS: 'Trainings',
  TICKETS: 'Tickets',
  AI_FEATURES: 'AI Features',
  WALLET: 'Wallet',
};

export const ALL_FEATURE_FLAGS = Object.keys(FEATURE_LABELS);

export function formatLimit(limitType: LimitType, limitValue: number): string {
  switch (limitType) {
    case 'UNLIMITED': return '∞';
    case 'DISABLED': return 'Disabled';
    case 'MONTHLY': return `${limitValue}/mo`;
    case 'TOTAL': return `${limitValue}`;
    default: return String(limitValue);
  }
}

export function getUsagePercent(current: number, limit: number, limitType: LimitType): number {
  if (limitType === 'UNLIMITED') return 0;
  if (limitType === 'DISABLED') return 100;
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((current / limit) * 100));
}

export function getUsageColor(percent: number): string {
  if (percent >= 90) return 'text-red-600';
  if (percent >= 70) return 'text-amber-500';
  return 'text-green-600';
}

export function getUsageBarColor(percent: number): string {
  if (percent >= 90) return 'bg-red-500';
  if (percent >= 70) return 'bg-amber-500';
  return 'bg-blue-500';
}

