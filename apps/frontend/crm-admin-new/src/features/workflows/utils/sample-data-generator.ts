// ── Mock Sample Data Generator ──────────────────────────
// Generates realistic Indian CRM sample data for workflow mock testing.

export interface MockSampleData {
  lead: Record<string, unknown>;
  contact: Record<string, unknown>;
  organization: Record<string, unknown>;
  invoice: Record<string, unknown>;
  quotation: Record<string, unknown>;
  task: Record<string, unknown>;
  activity: Record<string, unknown>;
  payment: Record<string, unknown>;
}

// ── Lead Variations ────────────────────────────────────

const LEAD_VARIATIONS: Record<string, unknown>[] = [
  {
    id: 'lead_1',
    name: 'Rajesh Kumar',
    email: 'rajesh@tatagroup.in',
    phone: '+91-9876543210',
    source: 'Website',
    status: 'new',
    value: 250000,
    stage: 'qualification',
    organizationId: 'org_1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lead_2',
    name: 'Anita Desai',
    email: 'anita.desai@wipro.in',
    phone: '+91-9123456780',
    source: 'Referral',
    status: 'contacted',
    value: 480000,
    stage: 'proposal',
    organizationId: 'org_2',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lead_3',
    name: 'Suresh Patel',
    email: 'suresh.patel@adanigroup.in',
    phone: '+91-8899776655',
    source: 'Trade Show',
    status: 'qualified',
    value: 720000,
    stage: 'negotiation',
    organizationId: 'org_3',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lead_4',
    name: 'Meera Iyer',
    email: 'meera.iyer@hcltech.in',
    phone: '+91-7788990011',
    source: 'LinkedIn',
    status: 'new',
    value: 150000,
    stage: 'prospecting',
    organizationId: 'org_4',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lead_5',
    name: 'Vikram Singh',
    email: 'vikram@mahindra.in',
    phone: '+91-9988776655',
    source: 'Cold Call',
    status: 'contacted',
    value: 900000,
    stage: 'qualification',
    organizationId: 'org_5',
    createdAt: new Date().toISOString(),
  },
];

// ── Contact Variations ─────────────────────────────────

const CONTACT_VARIATIONS: Record<string, unknown>[] = [
  {
    id: 'contact_1',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@infosys.in',
    phone: '+91-8765432109',
    city: 'Bangalore',
    state: 'Karnataka',
  },
  {
    id: 'contact_2',
    firstName: 'Amit',
    lastName: 'Gupta',
    email: 'amit.gupta@reliance.in',
    phone: '+91-9012345678',
    city: 'Mumbai',
    state: 'Maharashtra',
  },
  {
    id: 'contact_3',
    firstName: 'Deepa',
    lastName: 'Nair',
    email: 'deepa.nair@tcs.in',
    phone: '+91-8456789012',
    city: 'Chennai',
    state: 'Tamil Nadu',
  },
  {
    id: 'contact_4',
    firstName: 'Rahul',
    lastName: 'Verma',
    email: 'rahul.verma@birla.in',
    phone: '+91-7654321098',
    city: 'Delhi',
    state: 'Delhi',
  },
  {
    id: 'contact_5',
    firstName: 'Kavitha',
    lastName: 'Reddy',
    email: 'kavitha.reddy@techm.in',
    phone: '+91-9345678901',
    city: 'Hyderabad',
    state: 'Telangana',
  },
];

// ── Organization Variations ────────────────────────────

const ORGANIZATION_VARIATIONS: Record<string, unknown>[] = [
  {
    id: 'org_1',
    name: 'Reliance Industries',
    industry: 'Manufacturing',
    city: 'Mumbai',
    state: 'Maharashtra',
    website: 'www.ril.com',
    employeeCount: 50000,
  },
  {
    id: 'org_2',
    name: 'Infosys Limited',
    industry: 'IT Services',
    city: 'Bangalore',
    state: 'Karnataka',
    website: 'www.infosys.com',
    employeeCount: 300000,
  },
  {
    id: 'org_3',
    name: 'Tata Consultancy Services',
    industry: 'IT Services',
    city: 'Mumbai',
    state: 'Maharashtra',
    website: 'www.tcs.com',
    employeeCount: 600000,
  },
  {
    id: 'org_4',
    name: 'Hindustan Unilever',
    industry: 'FMCG',
    city: 'Mumbai',
    state: 'Maharashtra',
    website: 'www.hul.co.in',
    employeeCount: 21000,
  },
  {
    id: 'org_5',
    name: 'Bajaj Auto Limited',
    industry: 'Automobile',
    city: 'Pune',
    state: 'Maharashtra',
    website: 'www.bajajauto.com',
    employeeCount: 10000,
  },
];

// ── Invoice Variations ─────────────────────────────────

const INVOICE_VARIATIONS: Record<string, unknown>[] = [
  {
    id: 'inv_1',
    invoiceNumber: 'INV-2024-0042',
    amount: 150000,
    tax: 27000,
    total: 177000,
    status: 'pending',
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    contactId: 'contact_1',
    currency: 'INR',
  },
  {
    id: 'inv_2',
    invoiceNumber: 'INV-2024-0078',
    amount: 320000,
    tax: 57600,
    total: 377600,
    status: 'sent',
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    contactId: 'contact_2',
    currency: 'INR',
  },
  {
    id: 'inv_3',
    invoiceNumber: 'INV-2024-0103',
    amount: 85000,
    tax: 15300,
    total: 100300,
    status: 'overdue',
    dueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    contactId: 'contact_3',
    currency: 'INR',
  },
  {
    id: 'inv_4',
    invoiceNumber: 'INV-2024-0156',
    amount: 500000,
    tax: 90000,
    total: 590000,
    status: 'paid',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    contactId: 'contact_4',
    currency: 'INR',
  },
  {
    id: 'inv_5',
    invoiceNumber: 'INV-2024-0201',
    amount: 45000,
    tax: 8100,
    total: 53100,
    status: 'pending',
    dueDate: new Date(Date.now() + 20 * 86400000).toISOString(),
    contactId: 'contact_5',
    currency: 'INR',
  },
];

// ── Quotation Variations ───────────────────────────────

const QUOTATION_VARIATIONS: Record<string, unknown>[] = [
  {
    id: 'qt_1',
    quotationNumber: 'QT-2024-0015',
    amount: 350000,
    status: 'sent',
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
    items: [
      { name: 'CRM Enterprise License', qty: 1, rate: 200000, amount: 200000 },
      { name: 'Implementation Support', qty: 1, rate: 150000, amount: 150000 },
    ],
  },
  {
    id: 'qt_2',
    quotationNumber: 'QT-2024-0028',
    amount: 125000,
    status: 'draft',
    validUntil: new Date(Date.now() + 15 * 86400000).toISOString(),
    items: [
      { name: 'Annual Maintenance Contract', qty: 1, rate: 125000, amount: 125000 },
    ],
  },
  {
    id: 'qt_3',
    quotationNumber: 'QT-2024-0039',
    amount: 780000,
    status: 'approved',
    validUntil: new Date(Date.now() + 45 * 86400000).toISOString(),
    items: [
      { name: 'ERP Module Bundle', qty: 1, rate: 500000, amount: 500000 },
      { name: 'Training (40 hours)', qty: 1, rate: 180000, amount: 180000 },
      { name: 'Data Migration', qty: 1, rate: 100000, amount: 100000 },
    ],
  },
  {
    id: 'qt_4',
    quotationNumber: 'QT-2024-0052',
    amount: 65000,
    status: 'rejected',
    validUntil: new Date(Date.now() - 10 * 86400000).toISOString(),
    items: [
      { name: 'Support Upgrade', qty: 1, rate: 65000, amount: 65000 },
    ],
  },
  {
    id: 'qt_5',
    quotationNumber: 'QT-2024-0067',
    amount: 450000,
    status: 'sent',
    validUntil: new Date(Date.now() + 21 * 86400000).toISOString(),
    items: [
      { name: 'Cloud Hosting (1 Year)', qty: 1, rate: 250000, amount: 250000 },
      { name: 'SSL Certificate', qty: 5, rate: 10000, amount: 50000 },
      { name: 'Custom Domain Setup', qty: 1, rate: 150000, amount: 150000 },
    ],
  },
];

// ── Task Variations ────────────────────────────────────

const TASK_VARIATIONS: Record<string, unknown>[] = [
  {
    id: 'task_1',
    title: 'Follow up with Rajesh',
    type: 'follow_up',
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    assigneeId: 'user_1',
    status: 'pending',
  },
  {
    id: 'task_2',
    title: 'Prepare demo for Infosys team',
    type: 'demo',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    assigneeId: 'user_2',
    status: 'in_progress',
  },
  {
    id: 'task_3',
    title: 'Send revised quotation to Adani Group',
    type: 'document',
    priority: 'medium',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    assigneeId: 'user_1',
    status: 'pending',
  },
  {
    id: 'task_4',
    title: 'Schedule training for HCL onboarding',
    type: 'meeting',
    priority: 'medium',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    assigneeId: 'user_3',
    status: 'pending',
  },
  {
    id: 'task_5',
    title: 'Collect payment from Mahindra',
    type: 'follow_up',
    priority: 'high',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    assigneeId: 'user_2',
    status: 'overdue',
  },
];

// ── Activity Variations ────────────────────────────────

const ACTIVITY_VARIATIONS: Record<string, unknown>[] = [
  {
    id: 'activity_1',
    type: 'call',
    subject: 'Product Demo Call',
    date: new Date().toISOString(),
    duration: 30,
    notes: 'Discussed enterprise features, client interested in 50-user license.',
  },
  {
    id: 'activity_2',
    type: 'meeting',
    subject: 'Requirements Gathering - TCS',
    date: new Date().toISOString(),
    duration: 60,
    notes: 'Mapped 12 business processes. Need custom workflow module.',
  },
  {
    id: 'activity_3',
    type: 'email',
    subject: 'Sent Proposal to Reliance',
    date: new Date().toISOString(),
    duration: 15,
    notes: 'Attached PDF proposal with pricing tiers. Awaiting CFO approval.',
  },
  {
    id: 'activity_4',
    type: 'call',
    subject: 'Follow-up Call - Bajaj Auto',
    date: new Date().toISOString(),
    duration: 20,
    notes: 'Client requesting 15% discount on bulk order. Escalated to manager.',
  },
  {
    id: 'activity_5',
    type: 'note',
    subject: 'Internal Review - HUL Account',
    date: new Date().toISOString(),
    duration: 0,
    notes: 'Account health is green. Renewal due in Q4. Upsell opportunity for analytics module.',
  },
];

// ── Payment Variations ─────────────────────────────────

const PAYMENT_VARIATIONS: Record<string, unknown>[] = [
  {
    id: 'pay_1',
    amount: 177000,
    method: 'NEFT',
    referenceNumber: 'UTR123456789',
    invoiceId: 'inv_1',
    status: 'completed',
    receivedAt: new Date().toISOString(),
  },
  {
    id: 'pay_2',
    amount: 377600,
    method: 'RTGS',
    referenceNumber: 'RTGS20240315001',
    invoiceId: 'inv_2',
    status: 'completed',
    receivedAt: new Date().toISOString(),
  },
  {
    id: 'pay_3',
    amount: 50000,
    method: 'UPI',
    referenceNumber: 'UPI9876543210@ybl',
    invoiceId: 'inv_3',
    status: 'partial',
    receivedAt: new Date().toISOString(),
  },
  {
    id: 'pay_4',
    amount: 590000,
    method: 'Cheque',
    referenceNumber: 'CHQ-BOB-00456789',
    invoiceId: 'inv_4',
    status: 'completed',
    receivedAt: new Date().toISOString(),
  },
  {
    id: 'pay_5',
    amount: 53100,
    method: 'IMPS',
    referenceNumber: 'IMPS20240320045',
    invoiceId: 'inv_5',
    status: 'pending',
    receivedAt: new Date().toISOString(),
  },
];

// ── Variation Map ──────────────────────────────────────

const VARIATION_MAP: Record<string, Record<string, unknown>[]> = {
  lead: LEAD_VARIATIONS,
  contact: CONTACT_VARIATIONS,
  organization: ORGANIZATION_VARIATIONS,
  invoice: INVOICE_VARIATIONS,
  quotation: QUOTATION_VARIATIONS,
  task: TASK_VARIATIONS,
  activity: ACTIVITY_VARIATIONS,
  payment: PAYMENT_VARIATIONS,
};

// ── Public API ─────────────────────────────────────────

/**
 * Generate a complete set of mock CRM data (one record per entity).
 */
export function generateSampleData(): MockSampleData {
  return {
    lead: getRandomVariation('lead'),
    contact: getRandomVariation('contact'),
    organization: getRandomVariation('organization'),
    invoice: getRandomVariation('invoice'),
    quotation: getRandomVariation('quotation'),
    task: getRandomVariation('task'),
    activity: getRandomVariation('activity'),
    payment: getRandomVariation('payment'),
  };
}

/**
 * Generate sample data for a specific entity type.
 */
export function generateSampleDataForEntity(entity: string): Record<string, unknown> {
  const key = entity.toLowerCase();
  const variations = VARIATION_MAP[key];
  if (!variations || variations.length === 0) {
    return { id: `${key}_1`, type: key, name: `Sample ${entity}` };
  }
  const idx = Math.floor(Math.random() * variations.length);
  return { ...variations[idx] };
}

/**
 * Get a random variation for the given entity.
 */
export function getRandomVariation(entity: string): Record<string, unknown> {
  return generateSampleDataForEntity(entity);
}

/**
 * Get all variations for a given entity (for preview / selection).
 */
export function getAllVariations(entity: string): Record<string, unknown>[] {
  const key = entity.toLowerCase();
  return VARIATION_MAP[key]?.map((v) => ({ ...v })) ?? [];
}
