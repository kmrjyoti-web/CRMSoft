/**
 * Seed data for module definitions.
 * Used by ModuleDefinitionService.seed() to upsert all system modules.
 */
export const MODULE_SEED_DATA = [
  // CRM
  { code: 'CONTACTS', name: 'Contacts', category: 'CRM', isCore: true, iconName: 'users', sortOrder: 1, dependsOn: [] },
  { code: 'ORGANIZATIONS', name: 'Organizations', category: 'CRM', isCore: true, iconName: 'building-2', sortOrder: 2, dependsOn: [] },
  { code: 'ACTIVITIES', name: 'Activities', category: 'CRM', isCore: true, iconName: 'calendar', sortOrder: 3, dependsOn: ['CONTACTS'] },
  { code: 'FOLLOW_UPS', name: 'Follow-ups', category: 'CRM', isCore: true, iconName: 'bell', sortOrder: 4, dependsOn: ['CONTACTS'] },
  { code: 'TOUR_PLANS', name: 'Tour Plans', category: 'CRM', isCore: false, iconName: 'map-pin', sortOrder: 5, dependsOn: ['CONTACTS'] },

  // SALES
  { code: 'LEADS', name: 'Leads', category: 'SALES', isCore: true, iconName: 'target', sortOrder: 10, dependsOn: ['CONTACTS'] },
  { code: 'QUOTATIONS', name: 'Quotations', category: 'SALES', isCore: false, iconName: 'file-text', sortOrder: 11, dependsOn: ['LEADS'] },
  { code: 'PRODUCTS', name: 'Products', category: 'SALES', isCore: false, iconName: 'package', sortOrder: 12, dependsOn: [] },

  // FINANCE
  { code: 'INVOICES', name: 'Invoices', category: 'FINANCE', isCore: false, iconName: 'receipt', sortOrder: 20, dependsOn: ['QUOTATIONS'] },
  { code: 'PAYMENTS', name: 'Payments', category: 'FINANCE', isCore: false, iconName: 'credit-card', sortOrder: 21, dependsOn: ['INVOICES'] },

  // POST_SALES
  { code: 'INSTALLATIONS', name: 'Installations', category: 'POST_SALES', isCore: false, iconName: 'wrench', sortOrder: 30, dependsOn: ['INVOICES'] },
  { code: 'TRAININGS', name: 'Trainings', category: 'POST_SALES', isCore: false, iconName: 'graduation-cap', sortOrder: 31, dependsOn: ['CONTACTS'] },
  { code: 'TICKETS', name: 'Tickets', category: 'POST_SALES', isCore: false, iconName: 'ticket', sortOrder: 32, dependsOn: ['CONTACTS'] },

  // COMMUNICATION
  { code: 'EMAIL', name: 'Email', category: 'COMMUNICATION', isCore: false, iconName: 'mail', sortOrder: 40, dependsOn: ['CONTACTS'] },
  { code: 'WHATSAPP', name: 'WhatsApp', category: 'COMMUNICATION', isCore: false, iconName: 'message-circle', sortOrder: 41, dependsOn: ['CONTACTS'] },
  { code: 'TEMPLATES', name: 'Templates', category: 'COMMUNICATION', isCore: false, iconName: 'layout-template', sortOrder: 42, dependsOn: [] },

  // WORKFLOW
  { code: 'WORKFLOWS', name: 'Workflows', category: 'WORKFLOW', isCore: false, iconName: 'git-branch', sortOrder: 50, dependsOn: [] },

  // REPORTS
  { code: 'DASHBOARD', name: 'Dashboard', category: 'REPORTS', isCore: true, iconName: 'layout-dashboard', sortOrder: 60, dependsOn: [] },
  { code: 'REPORTS', name: 'Reports', category: 'REPORTS', isCore: false, iconName: 'bar-chart-3', sortOrder: 61, dependsOn: [] },

  // AI
  { code: 'AI_ASSISTANT', name: 'AI Assistant', category: 'AI', isCore: false, iconName: 'sparkles', sortOrder: 70, dependsOn: [] },

  // DEVELOPER
  { code: 'API_ACCESS', name: 'API Access', category: 'DEVELOPER', isCore: false, iconName: 'code-2', sortOrder: 80, dependsOn: [] },
  { code: 'WEBHOOKS', name: 'Webhooks', category: 'DEVELOPER', isCore: false, iconName: 'webhook', sortOrder: 81, dependsOn: [] },
];
