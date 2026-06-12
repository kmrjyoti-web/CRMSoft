import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncate(text: string | null | undefined, length: number): string {
  if (!text) return '-';
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/** Extract array data from API response (handles nested {data: [...]} or direct [...]) */
export function extractList<T>(res: unknown): T[] {
  if (!res || typeof res !== 'object') return [];
  const r = res as Record<string, unknown>;
  const d = r.data;
  if (Array.isArray(d)) return d as T[];
  if (d && typeof d === 'object') {
    const inner = (d as Record<string, unknown>).data;
    if (Array.isArray(inner)) return inner as T[];
  }
  return [];
}

/** Extract meta from paginated API response */
export function extractMeta(res: unknown): { totalPages?: number; total?: number } | undefined {
  if (!res || typeof res !== 'object') return undefined;
  const r = res as Record<string, unknown>;
  const d = r.data;
  if (d && typeof d === 'object') {
    const meta = (d as Record<string, unknown>).meta;
    if (meta && typeof meta === 'object') return meta as { totalPages?: number; total?: number };
  }
  if (r.meta && typeof r.meta === 'object') return r.meta as { totalPages?: number; total?: number };
  return undefined;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
