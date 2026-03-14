/**
 * Shared lookup seed data — used by both prisma/seed.ts and ResetLookupDefaultsHandler.
 * Add new system lookups here so they are seeded AND restorable via "Reset Defaults".
 */

export interface LookupSeedValue {
  value: string;
  label: string;
  icon?: string;
  color?: string;
}

export interface LookupSeedCategory {
  category: string;
  displayName: string;
  isSystem: boolean;
  values: LookupSeedValue[];
}

export const LOOKUP_SEED_DATA: LookupSeedCategory[] = [
  // ── Existing lookups ──────────────────────────────────
  {
    category: 'INDUSTRY',
    displayName: 'Industry',
    isSystem: true,
    values: [
      { value: 'IT_SOFTWARE', label: 'IT / Software', icon: '💻', color: '#3B82F6' },
      { value: 'FINANCE', label: 'Finance & Banking', icon: '🏦', color: '#10B981' },
      { value: 'HEALTHCARE', label: 'Healthcare', icon: '🏥', color: '#EF4444' },
      { value: 'MANUFACTURING', label: 'Manufacturing', icon: '🏭', color: '#F59E0B' },
      { value: 'RETAIL', label: 'Retail', icon: '🛒', color: '#8B5CF6' },
      { value: 'EDUCATION', label: 'Education', icon: '📚', color: '#06B6D4' },
      { value: 'REAL_ESTATE', label: 'Real Estate', icon: '🏢', color: '#EC4899' },
      { value: 'OTHER', label: 'Other', icon: '📋', color: '#6B7280' },
    ],
  },
  {
    category: 'INDUSTRY_TYPE',
    displayName: 'Industry Type',
    isSystem: true,
    values: [
      { value: 'IT_SOFTWARE', label: 'IT / Software', icon: '💻', color: '#3B82F6' },
      { value: 'FINANCE', label: 'Finance & Banking', icon: '🏦', color: '#10B981' },
      { value: 'HEALTHCARE', label: 'Healthcare', icon: '🏥', color: '#EF4444' },
      { value: 'MANUFACTURING', label: 'Manufacturing', icon: '🏭', color: '#F59E0B' },
      { value: 'RETAIL', label: 'Retail', icon: '🛒', color: '#8B5CF6' },
      { value: 'EDUCATION', label: 'Education', icon: '📚', color: '#06B6D4' },
      { value: 'REAL_ESTATE', label: 'Real Estate', icon: '🏢', color: '#EC4899' },
      { value: 'OTHER', label: 'Other', icon: '📋', color: '#6B7280' },
    ],
  },
  {
    category: 'LEAD_SOURCE',
    displayName: 'Lead Source',
    isSystem: true,
    values: [
      { value: 'WEBSITE', label: 'Website', icon: '🌐' },
      { value: 'REFERRAL', label: 'Referral', icon: '🤝' },
      { value: 'TRADE_SHOW', label: 'Trade Show', icon: '🎪' },
      { value: 'COLD_CALL', label: 'Cold Call', icon: '📞' },
      { value: 'SOCIAL_MEDIA', label: 'Social Media', icon: '📱' },
      { value: 'EMAIL_CAMPAIGN', label: 'Email Campaign', icon: '📧' },
    ],
  },
  {
    category: 'PRODUCT_INTEREST',
    displayName: 'Product Interest',
    isSystem: false,
    values: [
      { value: 'CRM', label: 'CRM Software' },
      { value: 'ERP', label: 'ERP Suite' },
      { value: 'HRM', label: 'HR Management' },
      { value: 'ACCOUNTING', label: 'Accounting Software' },
    ],
  },
  {
    category: 'CITY',
    displayName: 'City',
    isSystem: true,
    values: [
      { value: 'MUMBAI', label: 'Mumbai' },
      { value: 'DELHI', label: 'Delhi' },
      { value: 'BANGALORE', label: 'Bangalore' },
      { value: 'HYDERABAD', label: 'Hyderabad' },
      { value: 'CHENNAI', label: 'Chennai' },
      { value: 'PUNE', label: 'Pune' },
      { value: 'KOLKATA', label: 'Kolkata' },
      { value: 'AHMEDABAD', label: 'Ahmedabad' },
    ],
  },

  // ── Product lookups ───────────────────────────────────
  {
    category: 'INVENTORY_TYPE',
    displayName: 'Inventory Type',
    isSystem: true,
    values: [
      { value: 'PRODUCT', label: 'Product' },
      { value: 'SERVICE', label: 'Service' },
    ],
  },
  {
    category: 'PRODUCT_TYPE',
    displayName: 'Product Type',
    isSystem: true,
    values: [
      { value: 'SOFTWARE', label: 'Software' },
      { value: 'HARDWARE', label: 'Hardware' },
      { value: 'SERVICE', label: 'Service' },
      { value: 'SUBSCRIPTION', label: 'Subscription' },
      { value: 'LICENSE', label: 'License' },
    ],
  },
  {
    category: 'PRODUCT_CATEGORY',
    displayName: 'Product Category',
    isSystem: true,
    values: [
      { value: 'CRM', label: 'CRM' },
      { value: 'ERP', label: 'ERP' },
      { value: 'HRM', label: 'HRM' },
      { value: 'ACCOUNTING', label: 'Accounting' },
      { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
    ],
  },
  {
    category: 'PRODUCT_SEGMENT',
    displayName: 'Product Segment',
    isSystem: true,
    values: [
      { value: 'ENTERPRISE', label: 'Enterprise' },
      { value: 'SMB', label: 'SMB' },
      { value: 'STARTUP', label: 'Startup' },
      { value: 'INDIVIDUAL', label: 'Individual' },
    ],
  },
  {
    category: 'PRODUCT_DELIVERY',
    displayName: 'Product Delivery',
    isSystem: true,
    values: [
      { value: 'CLOUD', label: 'Cloud / SaaS' },
      { value: 'ON_PREMISE', label: 'On-Premise' },
      { value: 'HYBRID', label: 'Hybrid' },
    ],
  },
  {
    category: 'PRODUCT_LIFECYCLE',
    displayName: 'Product Lifecycle',
    isSystem: true,
    values: [
      { value: 'GA', label: 'Generally Available' },
      { value: 'BETA', label: 'Beta' },
      { value: 'EOL', label: 'End of Life' },
      { value: 'PREVIEW', label: 'Preview' },
    ],
  },

  // ── NEW: Contact & Raw Contact lookups ────────────────
  {
    category: 'CONTACT_SOURCE',
    displayName: 'Contact Source',
    isSystem: true,
    values: [
      { value: 'REFERRAL', label: 'Referral', icon: '🤝' },
      { value: 'WEBSITE', label: 'Website', icon: '🌐' },
      { value: 'TRADE_SHOW', label: 'Trade Show', icon: '🎪' },
      { value: 'COLD_CALL', label: 'Cold Call', icon: '📞' },
      { value: 'SOCIAL_MEDIA', label: 'Social Media', icon: '📱' },
      { value: 'EMAIL_CAMPAIGN', label: 'Email Campaign', icon: '📧' },
    ],
  },
  {
    category: 'CONTACT_CATEGORY',
    displayName: 'Contact Category',
    isSystem: true,
    values: [
      { value: 'CUSTOMER', label: 'Customer', icon: '👤', color: '#3B82F6' },
      { value: 'PROSPECT', label: 'Prospect', icon: '🎯', color: '#F59E0B' },
      { value: 'PARTNER', label: 'Partner', icon: '🤝', color: '#10B981' },
      { value: 'VENDOR', label: 'Vendor', icon: '🏪', color: '#8B5CF6' },
      { value: 'EMPLOYEE', label: 'Employee', icon: '👨‍💼', color: '#06B6D4' },
      { value: 'OTHER', label: 'Other', icon: '📋', color: '#6B7280' },
    ],
  },
  {
    category: 'RAW_CONTACT_SOURCE',
    displayName: 'Raw Contact Source',
    isSystem: true,
    values: [
      { value: 'MANUAL', label: 'Manual', icon: '✍️' },
      { value: 'BULK_IMPORT', label: 'Bulk Import', icon: '📥' },
      { value: 'WEB_FORM', label: 'Web Form', icon: '🌐' },
      { value: 'REFERRAL', label: 'Referral', icon: '🤝' },
      { value: 'API', label: 'API', icon: '🔌' },
    ],
  },

  // ── NEW: Department & Designation ─────────────────────
  {
    category: 'DEPARTMENT',
    displayName: 'Department',
    isSystem: true,
    values: [
      { value: 'SALES', label: 'Sales' },
      { value: 'MARKETING', label: 'Marketing' },
      { value: 'ENGINEERING', label: 'Engineering' },
      { value: 'HR', label: 'Human Resources' },
      { value: 'FINANCE', label: 'Finance' },
      { value: 'OPERATIONS', label: 'Operations' },
      { value: 'SUPPORT', label: 'Support' },
      { value: 'MANAGEMENT', label: 'Management' },
    ],
  },
  {
    category: 'DESIGNATION',
    displayName: 'Designation',
    isSystem: true,
    values: [
      { value: 'CEO', label: 'CEO' },
      { value: 'CTO', label: 'CTO' },
      { value: 'CFO', label: 'CFO' },
      { value: 'VP', label: 'Vice President' },
      { value: 'DIRECTOR', label: 'Director' },
      { value: 'MANAGER', label: 'Manager' },
      { value: 'EXECUTIVE', label: 'Executive' },
      { value: 'ASSOCIATE', label: 'Associate' },
      { value: 'INTERN', label: 'Intern' },
    ],
  },

  // ── NEW: Activity ─────────────────────────────────────
  {
    category: 'ACTIVITY_TYPE',
    displayName: 'Activity Type',
    isSystem: true,
    values: [
      { value: 'CALL', label: 'Call', icon: '📞' },
      { value: 'EMAIL', label: 'Email', icon: '📧' },
      { value: 'MEETING', label: 'Meeting', icon: '🤝' },
      { value: 'NOTE', label: 'Note', icon: '📝' },
      { value: 'WHATSAPP', label: 'WhatsApp', icon: '💬' },
      { value: 'SMS', label: 'SMS', icon: '📱' },
      { value: 'VISIT', label: 'Visit', icon: '🚗' },
    ],
  },

  // ── NEW: Finance & Quotation ──────────────────────────
  {
    category: 'UNIT_OF_MEASURE',
    displayName: 'Unit of Measure',
    isSystem: true,
    values: [
      { value: 'PIECE', label: 'Piece' },
      { value: 'BOX', label: 'Box' },
      { value: 'PACK', label: 'Pack' },
      { value: 'KG', label: 'Kg' },
      { value: 'GRAM', label: 'Gram' },
      { value: 'LITRE', label: 'Litre' },
      { value: 'METER', label: 'Meter' },
      { value: 'METRE', label: 'Metre' },
      { value: 'SET', label: 'Set' },
      { value: 'DOZEN', label: 'Dozen' },
      { value: 'ROLL', label: 'Roll' },
      { value: 'PAIR', label: 'Pair' },
      { value: 'OTHER', label: 'Other' },
    ],
  },
  {
    category: 'GST_RATE',
    displayName: 'GST Rate',
    isSystem: true,
    values: [
      { value: '0', label: '0%' },
      { value: '5', label: '5%' },
      { value: '12', label: '12%' },
      { value: '18', label: '18%' },
      { value: '28', label: '28%' },
    ],
  },
  {
    category: 'DISCOUNT_TYPE',
    displayName: 'Discount Type',
    isSystem: true,
    values: [
      { value: 'PERCENTAGE', label: '%' },
      { value: 'FLAT', label: 'Flat' },
    ],
  },
  {
    category: 'QUOTATION_PRICE_TYPE',
    displayName: 'Price Type',
    isSystem: true,
    values: [
      { value: 'FIXED', label: 'Fixed' },
      { value: 'RANGE', label: 'Range' },
      { value: 'NEGOTIABLE', label: 'Negotiable' },
    ],
  },
  {
    category: 'PAYMENT_METHOD',
    displayName: 'Payment Method',
    isSystem: true,
    values: [
      { value: 'CASH', label: 'Cash' },
      { value: 'CHEQUE', label: 'Cheque' },
      { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
      { value: 'UPI', label: 'UPI' },
      { value: 'CREDIT_CARD', label: 'Credit Card' },
      { value: 'DEBIT_CARD', label: 'Debit Card' },
      { value: 'NET_BANKING', label: 'Net Banking' },
      { value: 'WALLET', label: 'Wallet' },
      { value: 'RAZORPAY', label: 'Razorpay' },
      { value: 'STRIPE', label: 'Stripe' },
      { value: 'OTHER', label: 'Other' },
    ],
  },

  // ── NEW: Communication ────────────────────────────────
  {
    category: 'COMMUNICATION_CHANNEL',
    displayName: 'Communication Channel',
    isSystem: true,
    values: [
      { value: 'EMAIL', label: 'Email', icon: '📧' },
      { value: 'WHATSAPP', label: 'WhatsApp', icon: '💬' },
      { value: 'PORTAL', label: 'Portal', icon: '🌐' },
      { value: 'MANUAL', label: 'Manual', icon: '✍️' },
      { value: 'DOWNLOAD', label: 'Download', icon: '📥' },
      { value: 'SMS', label: 'SMS', icon: '📱' },
    ],
  },
  {
    category: 'TEMPLATE_CATEGORY',
    displayName: 'Template Category',
    isSystem: true,
    values: [
      { value: 'SALES', label: 'Sales' },
      { value: 'MARKETING', label: 'Marketing' },
      { value: 'SUPPORT', label: 'Support' },
      { value: 'NOTIFICATION', label: 'Notification' },
      { value: 'OTHER', label: 'Other' },
    ],
  },

  // ── NEW: Workflow ─────────────────────────────────────
  {
    category: 'WORKFLOW_TRIGGER_TYPE',
    displayName: 'Workflow Trigger',
    isSystem: true,
    values: [
      { value: 'MANUAL', label: 'Manual' },
      { value: 'AUTO', label: 'Auto' },
      { value: 'SCHEDULED', label: 'Scheduled' },
    ],
  },

  // ── Lead lookups ────────────────────────────────────
  {
    category: 'LEAD_TYPE',
    displayName: 'Lead Type',
    isSystem: true,
    values: [
      { value: 'HOT', label: 'Hot', color: '#EF4444' },
      { value: 'WARM', label: 'Warm', color: '#F59E0B' },
      { value: 'COLD', label: 'Cold', color: '#3B82F6' },
    ],
  },
  {
    category: 'LEAD_CATEGORY',
    displayName: 'Lead Category',
    isSystem: true,
    values: [
      { value: 'DIRECT', label: 'Direct' },
      { value: 'CHANNEL', label: 'Channel' },
      { value: 'PARTNER', label: 'Partner' },
      { value: 'ONLINE', label: 'Online' },
    ],
  },
  {
    category: 'LEAD_GROUP',
    displayName: 'Lead Group',
    isSystem: true,
    values: [
      { value: 'SMB', label: 'SMB' },
      { value: 'ENTERPRISE', label: 'Enterprise' },
      { value: 'GOVERNMENT', label: 'Government' },
      { value: 'STARTUP', label: 'Startup' },
    ],
  },
  {
    category: 'CUSTOMER_BUDGET',
    displayName: 'Customer Budget',
    isSystem: true,
    values: [
      { value: 'BELOW_1L', label: 'Below 1 Lakh' },
      { value: '1L_5L', label: '1 - 5 Lakhs' },
      { value: '5L_10L', label: '5 - 10 Lakhs' },
      { value: '10L_50L', label: '10 - 50 Lakhs' },
      { value: 'ABOVE_50L', label: 'Above 50 Lakhs' },
    ],
  },
  {
    category: 'PREVIOUS_SOFTWARE',
    displayName: 'Previous Software',
    isSystem: true,
    values: [
      { value: 'TALLY', label: 'Tally' },
      { value: 'SAP', label: 'SAP' },
      { value: 'ZOHO', label: 'Zoho' },
      { value: 'SALESFORCE', label: 'Salesforce' },
      { value: 'NONE', label: 'None' },
      { value: 'OTHER', label: 'Other' },
    ],
  },
  {
    category: 'IT_INFRA',
    displayName: 'IT Infrastructure',
    isSystem: true,
    values: [
      { value: 'CLOUD', label: 'Cloud' },
      { value: 'ON_PREMISE', label: 'On-Premise' },
      { value: 'HYBRID', label: 'Hybrid' },
      { value: 'NONE', label: 'None' },
    ],
  },

  // ── Organization lookups ────────────────────────────
  {
    category: 'ORGANIZATION_TYPE',
    displayName: 'Organization Type',
    isSystem: true,
    values: [
      { value: 'PRIVATE_LTD', label: 'Private Ltd' },
      { value: 'LLP', label: 'LLP' },
      { value: 'PARTNERSHIP', label: 'Partnership' },
      { value: 'SOLE_PROPRIETOR', label: 'Sole Proprietor' },
      { value: 'PUBLIC_LTD', label: 'Public Ltd' },
      { value: 'NGO', label: 'NGO' },
    ],
  },
  {
    category: 'ORGANIZATION_CATEGORY',
    displayName: 'Organization Category',
    isSystem: true,
    values: [
      { value: 'CLIENT', label: 'Client', color: '#3B82F6' },
      { value: 'PROSPECT', label: 'Prospect', color: '#F59E0B' },
      { value: 'VENDOR', label: 'Vendor', color: '#8B5CF6' },
      { value: 'PARTNER', label: 'Partner', color: '#10B981' },
      { value: 'DISTRIBUTOR', label: 'Distributor', color: '#06B6D4' },
    ],
  },
  {
    category: 'ORGANIZATION_GROUP',
    displayName: 'Organization Group',
    isSystem: true,
    values: [
      { value: 'CORPORATE', label: 'Corporate' },
      { value: 'SME', label: 'SME' },
      { value: 'MSME', label: 'MSME' },
      { value: 'GOVERNMENT', label: 'Government' },
      { value: 'STARTUP', label: 'Startup' },
    ],
  },
  {
    category: 'ORGANIZATION_STATUS',
    displayName: 'Organization Status',
    isSystem: true,
    values: [
      { value: 'ACTIVE_CLIENT', label: 'Active Client', color: '#10B981' },
      { value: 'CHURNED', label: 'Churned', color: '#EF4444' },
      { value: 'PROSPECT', label: 'Prospect', color: '#F59E0B' },
      { value: 'ON_HOLD', label: 'On Hold', color: '#6B7280' },
    ],
  },
  {
    category: 'BUSINESS_TYPE',
    displayName: 'Business Type',
    isSystem: true,
    values: [
      { value: 'B2B', label: 'B2B' },
      { value: 'B2C', label: 'B2C' },
      { value: 'B2B2C', label: 'B2B2C' },
      { value: 'D2C', label: 'D2C' },
    ],
  },
];
