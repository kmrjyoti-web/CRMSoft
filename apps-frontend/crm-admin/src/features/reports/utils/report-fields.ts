/* ------------------------------------------------------------------ */
/*  CRM Entity Fields for Report Designer                             */
/*  Defines all available data fields per entity with metadata         */
/* ------------------------------------------------------------------ */

export type FieldDataType = 'string' | 'number' | 'currency' | 'date' | 'boolean' | 'percent' | 'enum';

export type AggregationType = 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'COUNT_DISTINCT';

export interface DataField {
  key: string;
  label: string;
  dataType: FieldDataType;
  category?: string;
  description?: string;
  aggregations?: AggregationType[];
  enumValues?: string[];
}

export interface EntityDefinition {
  key: string;
  label: string;
  icon: string;
  description: string;
  fields: DataField[];
}

// ── Shared aggregation sets ──────────────────────────────────────────

const NUMERIC_AGGS: AggregationType[] = ['SUM', 'AVG', 'MIN', 'MAX', 'COUNT'];
const COUNT_AGGS: AggregationType[] = ['COUNT', 'COUNT_DISTINCT'];

// ── Entity Definitions ───────────────────────────────────────────────

export const ENTITY_DEFINITIONS: EntityDefinition[] = [
  {
    key: 'leads',
    label: 'Leads',
    icon: 'trending-up',
    description: 'Sales leads and pipeline',
    fields: [
      { key: 'id', label: 'Lead ID', dataType: 'string', category: 'Identity', aggregations: COUNT_AGGS },
      { key: 'title', label: 'Lead Title', dataType: 'string', category: 'Basic' },
      { key: 'status', label: 'Status', dataType: 'enum', category: 'Basic', enumValues: ['NEW', 'VERIFIED', 'CONTACTED', 'DEMO_SCHEDULED', 'DEMO_DONE', 'QUOTATION_SENT', 'NEGOTIATION', 'WON', 'LOST', 'ON_HOLD'], aggregations: COUNT_AGGS },
      { key: 'stage', label: 'Stage', dataType: 'string', category: 'Pipeline', aggregations: COUNT_AGGS },
      { key: 'source', label: 'Source', dataType: 'string', category: 'Basic', aggregations: COUNT_AGGS },
      { key: 'priority', label: 'Priority', dataType: 'enum', category: 'Basic', enumValues: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], aggregations: COUNT_AGGS },
      { key: 'expectedValue', label: 'Expected Value', dataType: 'currency', category: 'Financial', aggregations: NUMERIC_AGGS },
      { key: 'actualValue', label: 'Actual Value', dataType: 'currency', category: 'Financial', aggregations: NUMERIC_AGGS },
      { key: 'probability', label: 'Probability (%)', dataType: 'percent', category: 'Pipeline', aggregations: NUMERIC_AGGS },
      { key: 'expectedCloseDate', label: 'Expected Close Date', dataType: 'date', category: 'Dates' },
      { key: 'closedDate', label: 'Closed Date', dataType: 'date', category: 'Dates' },
      { key: 'createdAt', label: 'Created Date', dataType: 'date', category: 'Dates' },
      { key: 'lostReason', label: 'Lost Reason', dataType: 'string', category: 'Pipeline', aggregations: COUNT_AGGS },
      { key: 'requirements', label: 'Requirements', dataType: 'string', category: 'Details' },
      { key: 'description', label: 'Description', dataType: 'string', category: 'Details' },
      { key: 'contact.name', label: 'Contact Name', dataType: 'string', category: 'Related', aggregations: COUNT_AGGS },
      { key: 'contact.email', label: 'Contact Email', dataType: 'string', category: 'Related' },
      { key: 'contact.phone', label: 'Contact Phone', dataType: 'string', category: 'Related' },
      { key: 'organization.name', label: 'Organization', dataType: 'string', category: 'Related', aggregations: COUNT_AGGS },
      { key: 'organization.industry', label: 'Industry', dataType: 'string', category: 'Related', aggregations: COUNT_AGGS },
      { key: 'allocatedTo.name', label: 'Allocated To', dataType: 'string', category: 'Assignment', aggregations: COUNT_AGGS },
      { key: 'allocatedTo.email', label: 'Allocated To Email', dataType: 'string', category: 'Assignment' },
    ],
  },
  {
    key: 'contacts',
    label: 'Contacts',
    icon: 'users',
    description: 'Contact records',
    fields: [
      { key: 'id', label: 'Contact ID', dataType: 'string', category: 'Identity', aggregations: COUNT_AGGS },
      { key: 'firstName', label: 'First Name', dataType: 'string', category: 'Basic' },
      { key: 'lastName', label: 'Last Name', dataType: 'string', category: 'Basic' },
      { key: 'email', label: 'Email', dataType: 'string', category: 'Contact Info' },
      { key: 'phone', label: 'Phone', dataType: 'string', category: 'Contact Info' },
      { key: 'mobile', label: 'Mobile', dataType: 'string', category: 'Contact Info' },
      { key: 'designation', label: 'Designation', dataType: 'string', category: 'Professional', aggregations: COUNT_AGGS },
      { key: 'department', label: 'Department', dataType: 'string', category: 'Professional', aggregations: COUNT_AGGS },
      { key: 'source', label: 'Source', dataType: 'string', category: 'Basic', aggregations: COUNT_AGGS },
      { key: 'type', label: 'Type', dataType: 'enum', category: 'Basic', enumValues: ['RAW', 'VALIDATED'], aggregations: COUNT_AGGS },
      { key: 'organization.name', label: 'Organization', dataType: 'string', category: 'Related', aggregations: COUNT_AGGS },
      { key: 'createdAt', label: 'Created Date', dataType: 'date', category: 'Dates' },
    ],
  },
  {
    key: 'organizations',
    label: 'Organizations',
    icon: 'building',
    description: 'Company records',
    fields: [
      { key: 'id', label: 'Org ID', dataType: 'string', category: 'Identity', aggregations: COUNT_AGGS },
      { key: 'name', label: 'Organization Name', dataType: 'string', category: 'Basic' },
      { key: 'industry', label: 'Industry', dataType: 'string', category: 'Basic', aggregations: COUNT_AGGS },
      { key: 'website', label: 'Website', dataType: 'string', category: 'Contact Info' },
      { key: 'phone', label: 'Phone', dataType: 'string', category: 'Contact Info' },
      { key: 'email', label: 'Email', dataType: 'string', category: 'Contact Info' },
      { key: 'gstNumber', label: 'GST Number', dataType: 'string', category: 'Financial' },
      { key: 'annualRevenue', label: 'Annual Revenue', dataType: 'currency', category: 'Financial', aggregations: NUMERIC_AGGS },
      { key: 'employeeCount', label: 'Employee Count', dataType: 'number', category: 'Basic', aggregations: NUMERIC_AGGS },
      { key: 'city', label: 'City', dataType: 'string', category: 'Address', aggregations: COUNT_AGGS },
      { key: 'state', label: 'State', dataType: 'string', category: 'Address', aggregations: COUNT_AGGS },
      { key: 'country', label: 'Country', dataType: 'string', category: 'Address', aggregations: COUNT_AGGS },
      { key: 'createdAt', label: 'Created Date', dataType: 'date', category: 'Dates' },
    ],
  },
  {
    key: 'activities',
    label: 'Activities',
    icon: 'activity',
    description: 'Activity logs and follow-ups',
    fields: [
      { key: 'id', label: 'Activity ID', dataType: 'string', category: 'Identity', aggregations: COUNT_AGGS },
      { key: 'type', label: 'Activity Type', dataType: 'enum', category: 'Basic', enumValues: ['CALL', 'EMAIL', 'MEETING', 'NOTE', 'TASK', 'WHATSAPP', 'VISIT'], aggregations: COUNT_AGGS },
      { key: 'subject', label: 'Subject', dataType: 'string', category: 'Basic' },
      { key: 'description', label: 'Description', dataType: 'string', category: 'Basic' },
      { key: 'outcome', label: 'Outcome', dataType: 'string', category: 'Result', aggregations: COUNT_AGGS },
      { key: 'duration', label: 'Duration (min)', dataType: 'number', category: 'Timing', aggregations: NUMERIC_AGGS },
      { key: 'scheduledAt', label: 'Scheduled At', dataType: 'date', category: 'Dates' },
      { key: 'completedAt', label: 'Completed At', dataType: 'date', category: 'Dates' },
      { key: 'createdAt', label: 'Created Date', dataType: 'date', category: 'Dates' },
      { key: 'lead.title', label: 'Lead Title', dataType: 'string', category: 'Related', aggregations: COUNT_AGGS },
      { key: 'createdBy.name', label: 'Created By', dataType: 'string', category: 'Assignment', aggregations: COUNT_AGGS },
    ],
  },
  {
    key: 'quotations',
    label: 'Quotations',
    icon: 'file-text',
    description: 'Quotation records',
    fields: [
      { key: 'id', label: 'Quotation ID', dataType: 'string', category: 'Identity', aggregations: COUNT_AGGS },
      { key: 'quotationNumber', label: 'Quotation Number', dataType: 'string', category: 'Basic' },
      { key: 'status', label: 'Status', dataType: 'enum', category: 'Basic', enumValues: ['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'REVISED'], aggregations: COUNT_AGGS },
      { key: 'subTotal', label: 'Sub Total', dataType: 'currency', category: 'Financial', aggregations: NUMERIC_AGGS },
      { key: 'taxAmount', label: 'Tax Amount', dataType: 'currency', category: 'Financial', aggregations: NUMERIC_AGGS },
      { key: 'totalAmount', label: 'Total Amount', dataType: 'currency', category: 'Financial', aggregations: NUMERIC_AGGS },
      { key: 'discountAmount', label: 'Discount Amount', dataType: 'currency', category: 'Financial', aggregations: NUMERIC_AGGS },
      { key: 'grandTotal', label: 'Grand Total', dataType: 'currency', category: 'Financial', aggregations: NUMERIC_AGGS },
      { key: 'validUntil', label: 'Valid Until', dataType: 'date', category: 'Dates' },
      { key: 'createdAt', label: 'Created Date', dataType: 'date', category: 'Dates' },
      { key: 'version', label: 'Version', dataType: 'number', category: 'Basic', aggregations: NUMERIC_AGGS },
      { key: 'lead.title', label: 'Lead Title', dataType: 'string', category: 'Related', aggregations: COUNT_AGGS },
      { key: 'contact.name', label: 'Contact Name', dataType: 'string', category: 'Related', aggregations: COUNT_AGGS },
      { key: 'organization.name', label: 'Organization', dataType: 'string', category: 'Related', aggregations: COUNT_AGGS },
      { key: 'createdBy.name', label: 'Created By', dataType: 'string', category: 'Assignment', aggregations: COUNT_AGGS },
    ],
  },
  {
    key: 'demos',
    label: 'Demos',
    icon: 'monitor',
    description: 'Demo sessions',
    fields: [
      { key: 'id', label: 'Demo ID', dataType: 'string', category: 'Identity', aggregations: COUNT_AGGS },
      { key: 'title', label: 'Demo Title', dataType: 'string', category: 'Basic' },
      { key: 'status', label: 'Status', dataType: 'enum', category: 'Basic', enumValues: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'], aggregations: COUNT_AGGS },
      { key: 'mode', label: 'Mode', dataType: 'enum', category: 'Basic', enumValues: ['ONLINE', 'OFFLINE', 'HYBRID'], aggregations: COUNT_AGGS },
      { key: 'scheduledAt', label: 'Scheduled At', dataType: 'date', category: 'Dates' },
      { key: 'duration', label: 'Duration (min)', dataType: 'number', category: 'Timing', aggregations: NUMERIC_AGGS },
      { key: 'feedback', label: 'Feedback', dataType: 'string', category: 'Result' },
      { key: 'rating', label: 'Rating', dataType: 'number', category: 'Result', aggregations: NUMERIC_AGGS },
      { key: 'lead.title', label: 'Lead Title', dataType: 'string', category: 'Related', aggregations: COUNT_AGGS },
      { key: 'conductedBy.name', label: 'Conducted By', dataType: 'string', category: 'Assignment', aggregations: COUNT_AGGS },
      { key: 'createdAt', label: 'Created Date', dataType: 'date', category: 'Dates' },
    ],
  },
  {
    key: 'invoices',
    label: 'Invoices',
    icon: 'credit-card',
    description: 'Invoice records',
    fields: [
      { key: 'id', label: 'Invoice ID', dataType: 'string', category: 'Identity', aggregations: COUNT_AGGS },
      { key: 'invoiceNumber', label: 'Invoice Number', dataType: 'string', category: 'Basic' },
      { key: 'status', label: 'Status', dataType: 'enum', category: 'Basic', enumValues: ['DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED'], aggregations: COUNT_AGGS },
      { key: 'subTotal', label: 'Sub Total', dataType: 'currency', category: 'Financial', aggregations: NUMERIC_AGGS },
      { key: 'taxAmount', label: 'Tax Amount', dataType: 'currency', category: 'Financial', aggregations: NUMERIC_AGGS },
      { key: 'totalAmount', label: 'Total Amount', dataType: 'currency', category: 'Financial', aggregations: NUMERIC_AGGS },
      { key: 'paidAmount', label: 'Paid Amount', dataType: 'currency', category: 'Financial', aggregations: NUMERIC_AGGS },
      { key: 'dueAmount', label: 'Due Amount', dataType: 'currency', category: 'Financial', aggregations: NUMERIC_AGGS },
      { key: 'dueDate', label: 'Due Date', dataType: 'date', category: 'Dates' },
      { key: 'createdAt', label: 'Created Date', dataType: 'date', category: 'Dates' },
      { key: 'contact.name', label: 'Contact Name', dataType: 'string', category: 'Related', aggregations: COUNT_AGGS },
      { key: 'organization.name', label: 'Organization', dataType: 'string', category: 'Related', aggregations: COUNT_AGGS },
    ],
  },
  {
    key: 'tourPlans',
    label: 'Tour Plans',
    icon: 'map-pin',
    description: 'Field visit plans',
    fields: [
      { key: 'id', label: 'Plan ID', dataType: 'string', category: 'Identity', aggregations: COUNT_AGGS },
      { key: 'title', label: 'Title', dataType: 'string', category: 'Basic' },
      { key: 'status', label: 'Status', dataType: 'enum', category: 'Basic', enumValues: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED'], aggregations: COUNT_AGGS },
      { key: 'startDate', label: 'Start Date', dataType: 'date', category: 'Dates' },
      { key: 'endDate', label: 'End Date', dataType: 'date', category: 'Dates' },
      { key: 'visitCount', label: 'Visit Count', dataType: 'number', category: 'Metrics', aggregations: NUMERIC_AGGS },
      { key: 'completedVisits', label: 'Completed Visits', dataType: 'number', category: 'Metrics', aggregations: NUMERIC_AGGS },
      { key: 'user.name', label: 'Sales Person', dataType: 'string', category: 'Assignment', aggregations: COUNT_AGGS },
      { key: 'createdAt', label: 'Created Date', dataType: 'date', category: 'Dates' },
    ],
  },
];

// ── Helper functions ─────────────────────────────────────────────────

export function getEntityDefinition(key: string): EntityDefinition | undefined {
  return ENTITY_DEFINITIONS.find((e) => e.key === key);
}

export function getEntityFields(entityKey: string): DataField[] {
  return getEntityDefinition(entityKey)?.fields ?? [];
}

export function getFieldsByCategory(entityKey: string): Record<string, DataField[]> {
  const fields = getEntityFields(entityKey);
  return fields.reduce<Record<string, DataField[]>>((acc, field) => {
    const cat = field.category ?? 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(field);
    return acc;
  }, {});
}

export function getAggregableFields(entityKey: string): DataField[] {
  return getEntityFields(entityKey).filter((f) => f.aggregations && f.aggregations.length > 0);
}

export function getNumericFields(entityKey: string): DataField[] {
  return getEntityFields(entityKey).filter((f) =>
    f.dataType === 'number' || f.dataType === 'currency' || f.dataType === 'percent',
  );
}

export function getGroupableFields(entityKey: string): DataField[] {
  return getEntityFields(entityKey).filter((f) =>
    f.dataType === 'string' || f.dataType === 'enum' || f.dataType === 'date',
  );
}

export const AGGREGATION_LABELS: Record<AggregationType, string> = {
  COUNT: 'Count',
  SUM: 'Sum',
  AVG: 'Average',
  MIN: 'Minimum',
  MAX: 'Maximum',
  COUNT_DISTINCT: 'Distinct Count',
};

// ── Filter operators per data type ───────────────────────────────────

export interface FilterOperator {
  value: string;
  label: string;
}

export const FILTER_OPERATORS: Record<FieldDataType, FilterOperator[]> = {
  string: [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
    { value: 'isEmpty', label: 'Is Empty' },
    { value: 'isNotEmpty', label: 'Is Not Empty' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'gt', label: 'Greater Than' },
    { value: 'gte', label: 'Greater Or Equal' },
    { value: 'lt', label: 'Less Than' },
    { value: 'lte', label: 'Less Or Equal' },
    { value: 'between', label: 'Between' },
  ],
  currency: [
    { value: 'equals', label: 'Equals' },
    { value: 'gt', label: 'Greater Than' },
    { value: 'gte', label: 'Greater Or Equal' },
    { value: 'lt', label: 'Less Than' },
    { value: 'lte', label: 'Less Or Equal' },
    { value: 'between', label: 'Between' },
  ],
  percent: [
    { value: 'equals', label: 'Equals' },
    { value: 'gt', label: 'Greater Than' },
    { value: 'lt', label: 'Less Than' },
    { value: 'between', label: 'Between' },
  ],
  date: [
    { value: 'equals', label: 'On' },
    { value: 'gt', label: 'After' },
    { value: 'lt', label: 'Before' },
    { value: 'between', label: 'Between' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
  ],
  boolean: [
    { value: 'equals', label: 'Is' },
  ],
  enum: [
    { value: 'equals', label: 'Equals' },
    { value: 'in', label: 'Is Any Of' },
    { value: 'notIn', label: 'Is Not' },
  ],
};

// ── Data type icons ──────────────────────────────────────────────────

export const DATA_TYPE_ICONS: Record<FieldDataType, string> = {
  string: 'type',
  number: 'hash',
  currency: 'indian-rupee',
  date: 'calendar',
  boolean: 'check-square',
  percent: 'percent',
  enum: 'list',
};

export const DATA_TYPE_COLORS: Record<FieldDataType, string> = {
  string: 'text-blue-500',
  number: 'text-green-600',
  currency: 'text-emerald-600',
  date: 'text-orange-500',
  boolean: 'text-purple-500',
  percent: 'text-cyan-600',
  enum: 'text-pink-500',
};

// ── Predefined Formula Templates ────────────────────────────────────

export interface FormulaTemplate {
  id: string;
  label: string;
  expression: string;
  format: 'number' | 'currency' | 'percent';
  category: string;
  description: string;
}

export const PREDEFINED_FORMULAS: FormulaTemplate[] = [
  // Sales
  {
    id: 'profit-margin',
    label: 'Profit Margin',
    expression: '({actualValue} - {expectedValue}) / {actualValue} * 100',
    format: 'percent',
    category: 'Sales',
    description: 'Profit as a percentage of actual revenue',
  },
  {
    id: 'conversion-rate',
    label: 'Lead Conversion Rate',
    expression: 'COUNT({leads.status:WON}) / COUNT({leads.id}) * 100',
    format: 'percent',
    category: 'Sales',
    description: 'Percentage of leads converted to won deals',
  },
  {
    id: 'avg-deal-size',
    label: 'Average Deal Size',
    expression: 'SUM({leads.actualValue}) / COUNT({leads.status:WON})',
    format: 'currency',
    category: 'Sales',
    description: 'Average value of won deals',
  },
  {
    id: 'win-rate',
    label: 'Win Rate',
    expression: 'COUNT({leads.status:WON}) / (COUNT({leads.status:WON}) + COUNT({leads.status:LOST})) * 100',
    format: 'percent',
    category: 'Sales',
    description: 'Won deals vs total closed deals',
  },
  {
    id: 'pipeline-value',
    label: 'Pipeline Value',
    expression: 'SUM({leads.expectedValue}) * AVG({leads.probability}) / 100',
    format: 'currency',
    category: 'Sales',
    description: 'Weighted pipeline value based on probability',
  },
  {
    id: 'revenue-per-rep',
    label: 'Revenue per Sales Rep',
    expression: 'SUM({leads.actualValue}) / COUNT_DISTINCT({leads.allocatedTo.name})',
    format: 'currency',
    category: 'Sales',
    description: 'Average revenue generated per sales representative',
  },
  // Financial
  {
    id: 'outstanding-amount',
    label: 'Outstanding Amount',
    expression: '{totalAmount} - {paidAmount}',
    format: 'currency',
    category: 'Financial',
    description: 'Total amount minus paid amount',
  },
  {
    id: 'collection-rate',
    label: 'Collection Rate',
    expression: 'SUM({invoices.paidAmount}) / SUM({invoices.totalAmount}) * 100',
    format: 'percent',
    category: 'Financial',
    description: 'Percentage of invoiced amount collected',
  },
  {
    id: 'tax-rate',
    label: 'Effective Tax Rate',
    expression: 'SUM({taxAmount}) / SUM({subTotal}) * 100',
    format: 'percent',
    category: 'Financial',
    description: 'Tax as percentage of subtotal',
  },
  {
    id: 'discount-pct',
    label: 'Discount %',
    expression: 'SUM({discountAmount}) / SUM({subTotal}) * 100',
    format: 'percent',
    category: 'Financial',
    description: 'Average discount percentage',
  },
  {
    id: 'overdue-amount',
    label: 'Total Overdue Amount',
    expression: 'SUM({invoices.dueAmount:OVERDUE})',
    format: 'currency',
    category: 'Financial',
    description: 'Sum of all overdue invoice amounts',
  },
  // Activity
  {
    id: 'activity-completion',
    label: 'Activity Completion Rate',
    expression: 'COUNT({activities.completedAt:NOT_NULL}) / COUNT({activities.id}) * 100',
    format: 'percent',
    category: 'Activity',
    description: 'Percentage of activities completed',
  },
  {
    id: 'avg-activity-duration',
    label: 'Average Activity Duration',
    expression: 'AVG({activities.duration})',
    format: 'number',
    category: 'Activity',
    description: 'Average duration of activities in minutes',
  },
  {
    id: 'activities-per-lead',
    label: 'Activities per Lead',
    expression: 'COUNT({activities.id}) / COUNT_DISTINCT({activities.lead.title})',
    format: 'number',
    category: 'Activity',
    description: 'Average number of activities per lead',
  },
  // Quotation
  {
    id: 'quotation-acceptance',
    label: 'Quotation Acceptance Rate',
    expression: 'COUNT({quotations.status:ACCEPTED}) / COUNT({quotations.id}) * 100',
    format: 'percent',
    category: 'Quotation',
    description: 'Percentage of quotations accepted by clients',
  },
  {
    id: 'avg-quotation-value',
    label: 'Average Quotation Value',
    expression: 'AVG({quotations.grandTotal})',
    format: 'currency',
    category: 'Quotation',
    description: 'Average value of all quotations',
  },
  // Demo
  {
    id: 'demo-success-rate',
    label: 'Demo Success Rate',
    expression: 'COUNT({demos.status:COMPLETED}) / COUNT({demos.id}) * 100',
    format: 'percent',
    category: 'Demo',
    description: 'Percentage of scheduled demos completed successfully',
  },
  {
    id: 'avg-demo-rating',
    label: 'Average Demo Rating',
    expression: 'AVG({demos.rating})',
    format: 'number',
    category: 'Demo',
    description: 'Average rating from completed demos',
  },
  // Tour Plan
  {
    id: 'visit-completion',
    label: 'Visit Completion Rate',
    expression: 'SUM({tourPlans.completedVisits}) / SUM({tourPlans.visitCount}) * 100',
    format: 'percent',
    category: 'Tour Plan',
    description: 'Percentage of planned visits completed',
  },
];

export function getFormulasByCategory(): Record<string, FormulaTemplate[]> {
  return PREDEFINED_FORMULAS.reduce<Record<string, FormulaTemplate[]>>((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {});
}

// ── Sample Data for Preview Mode ────────────────────────────────────

export const SAMPLE_DATA: Record<string, Record<string, unknown>[]> = {
  leads: [
    { id: 'L001', title: 'Enterprise CRM Deal', status: 'WON', stage: 'Closed', source: 'Website', priority: 'HIGH', expectedValue: 250000, actualValue: 275000, probability: 90, expectedCloseDate: '2026-02-15', closedDate: '2026-02-10', createdAt: '2026-01-05', 'contact.name': 'Rahul Sharma', 'organization.name': 'Acme Corp', 'allocatedTo.name': 'Priya Singh' },
    { id: 'L002', title: 'SMB Package', status: 'NEGOTIATION', stage: 'Negotiation', source: 'Referral', priority: 'MEDIUM', expectedValue: 75000, actualValue: 0, probability: 60, expectedCloseDate: '2026-03-20', createdAt: '2026-01-18', 'contact.name': 'Amit Patel', 'organization.name': 'TechVista', 'allocatedTo.name': 'Ravi Kumar' },
    { id: 'L003', title: 'Annual Maintenance', status: 'CONTACTED', stage: 'Qualification', source: 'Email', priority: 'LOW', expectedValue: 45000, actualValue: 0, probability: 30, expectedCloseDate: '2026-04-01', createdAt: '2026-02-01', 'contact.name': 'Sneha Gupta', 'organization.name': 'InfoSys Ltd', 'allocatedTo.name': 'Priya Singh' },
    { id: 'L004', title: 'Custom Integration', status: 'DEMO_DONE', stage: 'Demo', source: 'LinkedIn', priority: 'HIGH', expectedValue: 180000, actualValue: 0, probability: 70, expectedCloseDate: '2026-03-25', createdAt: '2026-01-22', 'contact.name': 'Vikram Joshi', 'organization.name': 'DataFlow Inc', 'allocatedTo.name': 'Ravi Kumar' },
    { id: 'L005', title: 'Starter Plan', status: 'LOST', stage: 'Closed', source: 'Website', priority: 'LOW', expectedValue: 25000, actualValue: 0, probability: 0, expectedCloseDate: '2026-02-28', closedDate: '2026-02-25', lostReason: 'Budget', createdAt: '2026-01-10', 'contact.name': 'Meera Das', 'organization.name': 'QuickStart', 'allocatedTo.name': 'Priya Singh' },
  ],
  contacts: [
    { id: 'C001', firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@acme.com', phone: '+91-9876543210', designation: 'CTO', department: 'Technology', source: 'Website', type: 'VALIDATED', 'organization.name': 'Acme Corp', createdAt: '2026-01-02' },
    { id: 'C002', firstName: 'Amit', lastName: 'Patel', email: 'amit@techvista.com', phone: '+91-9876543211', designation: 'CEO', department: 'Management', source: 'Referral', type: 'VALIDATED', 'organization.name': 'TechVista', createdAt: '2026-01-10' },
    { id: 'C003', firstName: 'Sneha', lastName: 'Gupta', email: 'sneha@infosys.com', phone: '+91-9876543212', designation: 'Manager', department: 'Procurement', source: 'Email', type: 'RAW', 'organization.name': 'InfoSys Ltd', createdAt: '2026-01-20' },
  ],
  organizations: [
    { id: 'O001', name: 'Acme Corp', industry: 'Technology', website: 'acme.com', phone: '+91-11-23456789', gstNumber: '07AABCU9603R1ZM', annualRevenue: 50000000, employeeCount: 250, city: 'Mumbai', state: 'Maharashtra', country: 'India', createdAt: '2025-12-15' },
    { id: 'O002', name: 'TechVista', industry: 'Software', website: 'techvista.in', phone: '+91-80-12345678', gstNumber: '29AABCU9603R1ZN', annualRevenue: 12000000, employeeCount: 50, city: 'Bangalore', state: 'Karnataka', country: 'India', createdAt: '2026-01-05' },
    { id: 'O003', name: 'InfoSys Ltd', industry: 'IT Services', website: 'infosys.com', phone: '+91-44-98765432', gstNumber: '33AABCU9603R1ZP', annualRevenue: 120000000, employeeCount: 2000, city: 'Chennai', state: 'Tamil Nadu', country: 'India', createdAt: '2025-11-20' },
  ],
  quotations: [
    { id: 'Q001', quotationNumber: 'QT-2026-001', status: 'ACCEPTED', subTotal: 250000, taxAmount: 45000, totalAmount: 295000, discountAmount: 12500, grandTotal: 282500, validUntil: '2026-03-15', version: 2, 'lead.title': 'Enterprise CRM Deal', 'contact.name': 'Rahul Sharma', 'organization.name': 'Acme Corp', createdAt: '2026-02-01' },
    { id: 'Q002', quotationNumber: 'QT-2026-002', status: 'SENT', subTotal: 75000, taxAmount: 13500, totalAmount: 88500, discountAmount: 0, grandTotal: 88500, validUntil: '2026-04-01', version: 1, 'lead.title': 'SMB Package', 'contact.name': 'Amit Patel', 'organization.name': 'TechVista', createdAt: '2026-02-15' },
  ],
  invoices: [
    { id: 'I001', invoiceNumber: 'INV-2026-001', status: 'PAID', subTotal: 250000, taxAmount: 45000, totalAmount: 295000, paidAmount: 295000, dueAmount: 0, dueDate: '2026-03-01', 'contact.name': 'Rahul Sharma', 'organization.name': 'Acme Corp', createdAt: '2026-02-10' },
    { id: 'I002', invoiceNumber: 'INV-2026-002', status: 'PARTIALLY_PAID', subTotal: 75000, taxAmount: 13500, totalAmount: 88500, paidAmount: 44250, dueAmount: 44250, dueDate: '2026-04-01', 'contact.name': 'Amit Patel', 'organization.name': 'TechVista', createdAt: '2026-02-20' },
    { id: 'I003', invoiceNumber: 'INV-2026-003', status: 'OVERDUE', subTotal: 45000, taxAmount: 8100, totalAmount: 53100, paidAmount: 0, dueAmount: 53100, dueDate: '2026-02-15', 'contact.name': 'Sneha Gupta', 'organization.name': 'InfoSys Ltd', createdAt: '2026-01-25' },
  ],
  activities: [
    { id: 'A001', type: 'CALL', subject: 'Follow-up call', outcome: 'Interested', duration: 15, scheduledAt: '2026-02-10', completedAt: '2026-02-10', 'lead.title': 'Enterprise CRM Deal', 'createdBy.name': 'Priya Singh', createdAt: '2026-02-09' },
    { id: 'A002', type: 'MEETING', subject: 'Product demo', outcome: 'Positive', duration: 45, scheduledAt: '2026-02-12', completedAt: '2026-02-12', 'lead.title': 'SMB Package', 'createdBy.name': 'Ravi Kumar', createdAt: '2026-02-10' },
    { id: 'A003', type: 'EMAIL', subject: 'Proposal sent', outcome: 'Sent', duration: 5, scheduledAt: '2026-02-14', completedAt: '2026-02-14', 'lead.title': 'Custom Integration', 'createdBy.name': 'Priya Singh', createdAt: '2026-02-13' },
  ],
  demos: [
    { id: 'D001', title: 'CRM Full Demo', status: 'COMPLETED', mode: 'ONLINE', scheduledAt: '2026-02-12', duration: 60, feedback: 'Very impressed', rating: 5, 'lead.title': 'Enterprise CRM Deal', 'conductedBy.name': 'Ravi Kumar', createdAt: '2026-02-10' },
    { id: 'D002', title: 'Quick Overview', status: 'SCHEDULED', mode: 'HYBRID', scheduledAt: '2026-03-05', duration: 30, 'lead.title': 'SMB Package', 'conductedBy.name': 'Priya Singh', createdAt: '2026-02-25' },
  ],
  tourPlans: [
    { id: 'T001', title: 'Mumbai Client Visits', status: 'COMPLETED', startDate: '2026-02-01', endDate: '2026-02-05', visitCount: 8, completedVisits: 7, 'user.name': 'Ravi Kumar', createdAt: '2026-01-25' },
    { id: 'T002', title: 'Bangalore Tour', status: 'IN_PROGRESS', startDate: '2026-03-01', endDate: '2026-03-04', visitCount: 6, completedVisits: 3, 'user.name': 'Priya Singh', createdAt: '2026-02-20' },
  ],
};

export function getSampleRows(entityKey: string, limit?: number): Record<string, unknown>[] {
  const rows = SAMPLE_DATA[entityKey] ?? [];
  return limit ? rows.slice(0, limit) : rows;
}
