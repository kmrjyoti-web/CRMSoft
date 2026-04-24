import type { ReportCategory, ReportMetric, SectionType } from '../types/report.types';

// ── Category helpers ─────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  SALES: 'Sales',
  LEAD: 'Lead',
  CONTACT_ORG: 'Contact & Org',
  ACTIVITY: 'Activity',
  DEMO: 'Demo',
  QUOTATION: 'Quotation',
  TOUR_PLAN: 'Tour Plan',
  TEAM: 'Team',
  COMMUNICATION: 'Communication',
  EXECUTIVE: 'Executive',
  CUSTOM: 'Custom',
};

const CATEGORY_COLORS: Record<string, string> = {
  SALES: 'primary',
  LEAD: 'success',
  CONTACT_ORG: 'secondary',
  ACTIVITY: 'warning',
  DEMO: 'primary',
  QUOTATION: 'default',
  TOUR_PLAN: 'success',
  TEAM: 'primary',
  COMMUNICATION: 'warning',
  EXECUTIVE: 'danger',
  CUSTOM: 'outline',
};

const CATEGORY_ICONS: Record<string, string> = {
  SALES: 'trending-up',
  LEAD: 'target',
  CONTACT_ORG: 'users',
  ACTIVITY: 'activity',
  DEMO: 'monitor',
  QUOTATION: 'file-text',
  TOUR_PLAN: 'map-pin',
  TEAM: 'users',
  COMMUNICATION: 'mail',
  EXECUTIVE: 'briefcase',
  CUSTOM: 'settings',
};

export function getCategoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat;
}

export function getCategoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] ?? 'default';
}

export function getCategoryIcon(cat: string): string {
  return CATEGORY_ICONS[cat] ?? 'bar-chart';
}

// ── Metric formatting ────────────────────────────────────────────────

export function formatMetricValue(metric: ReportMetric): string {
  const { value, format } = metric;
  if (value == null) return '\u2014';
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(value);
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'days':
      return `${value.toFixed(1)} days`;
    case 'number':
    default:
      return new Intl.NumberFormat('en-IN').format(value);
  }
}

export function getChangeColor(dir?: string): string {
  if (dir === 'UP') return 'text-green-600';
  if (dir === 'DOWN') return 'text-red-600';
  return 'text-gray-500';
}

export function getChangeIcon(dir?: string): string {
  if (dir === 'UP') return 'trending-up';
  if (dir === 'DOWN') return 'trending-down';
  return 'minus';
}

// ── Section type helpers ─────────────────────────────────────────────

const SECTION_LABELS: Record<SectionType, string> = {
  heading: 'Heading',
  text: 'Text Block',
  divider: 'Divider',
  spacer: 'Spacer',
  'kpi-row': 'KPI Metrics',
  chart: 'Chart',
  table: 'Data Table',
  comparison: 'Period Comparison',
  'data-field': 'Data Field',
  formula: 'Formula',
  image: 'Image / Logo',
  'group-header': 'Group Header',
  'summary-row': 'Summary Row',
};

const SECTION_ICONS: Record<SectionType, string> = {
  heading: 'type',
  text: 'align-left',
  divider: 'minus',
  spacer: 'more-horizontal',
  'kpi-row': 'bar-chart-2',
  chart: 'pie-chart',
  table: 'table2',
  comparison: 'git-commit',
  'data-field': 'hash',
  formula: 'percent',
  image: 'image',
  'group-header': 'layers',
  'summary-row': 'bar-chart',
};

export function getSectionLabel(type: SectionType): string {
  return SECTION_LABELS[type] ?? type;
}

export function getSectionIcon(type: SectionType): string {
  return SECTION_ICONS[type] ?? 'square';
}

// ── Chart colors ─────────────────────────────────────────────────────

export const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#e11d48', '#0891b2', '#7c3aed', '#059669',
];

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

// ── Section ID generator ─────────────────────────────────────────────

let sectionCounter = 0;
export function generateSectionId(): string {
  sectionCounter++;
  return `section-${Date.now()}-${sectionCounter}`;
}

// ── Frequency helpers ────────────────────────────────────────────────

export const FREQUENCY_OPTIONS = [
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Quarterly', value: 'QUARTERLY' },
  { label: 'Yearly', value: 'YEARLY' },
];

export const DAY_OF_WEEK_OPTIONS = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
];

export const FORMAT_OPTIONS = [
  { label: 'PDF', value: 'PDF' },
  { label: 'Excel', value: 'XLSX' },
  { label: 'CSV', value: 'CSV' },
];
