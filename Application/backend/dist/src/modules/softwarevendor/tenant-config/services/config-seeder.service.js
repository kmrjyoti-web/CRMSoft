"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigSeederService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const SEED_CONFIGS = [
    { category: 'GENERAL', configKey: 'timezone', configValue: 'Asia/Kolkata', defaultValue: 'Asia/Kolkata', valueType: 'STRING', displayName: 'Timezone', description: 'Default timezone for the organization', groupName: 'Regional', sortOrder: 1 },
    { category: 'GENERAL', configKey: 'currency', configValue: 'INR', defaultValue: 'INR', valueType: 'ENUM', displayName: 'Currency', description: 'Default currency for quotations and invoices', groupName: 'Regional', sortOrder: 2, enumOptions: ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD'] },
    { category: 'GENERAL', configKey: 'currencySymbol', configValue: '₹', defaultValue: '₹', valueType: 'STRING', displayName: 'Currency Symbol', groupName: 'Regional', sortOrder: 3 },
    { category: 'GENERAL', configKey: 'dateFormat', configValue: 'DD/MM/YYYY', defaultValue: 'DD/MM/YYYY', valueType: 'ENUM', displayName: 'Date Format', groupName: 'Regional', sortOrder: 4, enumOptions: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
    { category: 'GENERAL', configKey: 'language', configValue: 'en', defaultValue: 'en', valueType: 'ENUM', displayName: 'Language', groupName: 'Regional', sortOrder: 5, enumOptions: ['en', 'hi', 'ta', 'te', 'kn', 'mr'] },
    { category: 'GENERAL', configKey: 'fiscalYearStart', configValue: 'April', defaultValue: 'April', valueType: 'ENUM', displayName: 'Fiscal Year Start Month', groupName: 'Regional', sortOrder: 6, enumOptions: ['January', 'April', 'July', 'October'] },
    { category: 'GENERAL', configKey: 'countryCode', configValue: 'IN', defaultValue: 'IN', valueType: 'STRING', displayName: 'Country Code', groupName: 'Regional', sortOrder: 7 },
    { category: 'GENERAL', configKey: 'phoneCountryCode', configValue: '+91', defaultValue: '+91', valueType: 'STRING', displayName: 'Phone Country Code', groupName: 'Regional', sortOrder: 8 },
    { category: 'NUMBERING', configKey: 'leadPrefix', configValue: 'LD', defaultValue: 'LD', valueType: 'STRING', displayName: 'Lead Number Prefix', groupName: 'Number Formats', sortOrder: 1 },
    { category: 'NUMBERING', configKey: 'leadNumberFormat', configValue: '{PREFIX}-{YYYYMM}-{SEQ}', defaultValue: '{PREFIX}-{YYYYMM}-{SEQ}', valueType: 'STRING', displayName: 'Lead Number Format', description: 'Supports: {PREFIX}, {YYYY}, {YYYYMM}, {SEQ}', groupName: 'Number Formats', sortOrder: 2 },
    { category: 'NUMBERING', configKey: 'contactPrefix', configValue: 'CT', defaultValue: 'CT', valueType: 'STRING', displayName: 'Contact Number Prefix', groupName: 'Number Formats', sortOrder: 3 },
    { category: 'NUMBERING', configKey: 'quotationPrefix', configValue: 'QT', defaultValue: 'QT', valueType: 'STRING', displayName: 'Quotation Number Prefix', groupName: 'Number Formats', sortOrder: 4 },
    { category: 'NUMBERING', configKey: 'invoicePrefix', configValue: 'INV', defaultValue: 'INV', valueType: 'STRING', displayName: 'Invoice Number Prefix', groupName: 'Number Formats', sortOrder: 5 },
    { category: 'NUMBERING', configKey: 'ticketPrefix', configValue: 'TK', defaultValue: 'TK', valueType: 'STRING', displayName: 'Ticket Number Prefix', groupName: 'Number Formats', sortOrder: 6 },
    { category: 'NUMBERING', configKey: 'sequenceResetPolicy', configValue: 'MONTHLY', defaultValue: 'MONTHLY', valueType: 'ENUM', displayName: 'Sequence Reset Policy', description: 'When to reset auto-increment counters', groupName: 'Number Formats', sortOrder: 7, enumOptions: ['NEVER', 'MONTHLY', 'YEARLY'] },
    { category: 'BUSINESS_HOURS', configKey: 'workDays', configValue: '["Monday","Tuesday","Wednesday","Thursday","Friday"]', defaultValue: '["Monday","Tuesday","Wednesday","Thursday","Friday"]', valueType: 'JSON', displayName: 'Working Days', groupName: 'Schedule', sortOrder: 1 },
    { category: 'BUSINESS_HOURS', configKey: 'workStartTime', configValue: '09:00', defaultValue: '09:00', valueType: 'STRING', displayName: 'Work Start Time', groupName: 'Schedule', sortOrder: 2, validationRule: '^([01]\\d|2[0-3]):[0-5]\\d$' },
    { category: 'BUSINESS_HOURS', configKey: 'workEndTime', configValue: '18:00', defaultValue: '18:00', valueType: 'STRING', displayName: 'Work End Time', groupName: 'Schedule', sortOrder: 3, validationRule: '^([01]\\d|2[0-3]):[0-5]\\d$' },
    { category: 'BUSINESS_HOURS', configKey: 'holidays', configValue: '[]', defaultValue: '[]', valueType: 'JSON', displayName: 'Holiday Calendar', description: 'Array of dates in YYYY-MM-DD format', groupName: 'Schedule', sortOrder: 4 },
    { category: 'LEAD_SETTINGS', configKey: 'autoAssignEnabled', configValue: 'false', defaultValue: 'false', valueType: 'BOOLEAN', displayName: 'Enable Auto-Assignment', description: 'Automatically assign new leads to team members', groupName: 'Assignment', sortOrder: 1 },
    { category: 'LEAD_SETTINGS', configKey: 'defaultAssignMode', configValue: 'ROUND_ROBIN', defaultValue: 'ROUND_ROBIN', valueType: 'ENUM', displayName: 'Assignment Mode', groupName: 'Assignment', sortOrder: 2, enumOptions: ['ROUND_ROBIN', 'LEAST_LOADED', 'MANUAL'] },
    { category: 'LEAD_SETTINGS', configKey: 'maxLeadsPerUser', configValue: '100', defaultValue: '100', valueType: 'INTEGER', displayName: 'Max Leads Per User', groupName: 'Limits', sortOrder: 3, minValue: 10, maxValue: 10000 },
    { category: 'LEAD_SETTINGS', configKey: 'leadExpiryDays', configValue: '90', defaultValue: '90', valueType: 'INTEGER', displayName: 'Lead Expiry (Days)', description: 'Days after which untouched leads are marked expired', groupName: 'Lifecycle', sortOrder: 4, minValue: 7, maxValue: 365 },
    { category: 'LEAD_SETTINGS', configKey: 'staleLeadDays', configValue: '14', defaultValue: '14', valueType: 'INTEGER', displayName: 'Stale Lead Threshold (Days)', groupName: 'Lifecycle', sortOrder: 5, minValue: 1, maxValue: 90 },
    { category: 'LEAD_SETTINGS', configKey: 'requireLostReason', configValue: 'true', defaultValue: 'true', valueType: 'BOOLEAN', displayName: 'Require Lost Reason', description: 'Require reason when marking a lead as lost', groupName: 'Rules', sortOrder: 6 },
    { category: 'COMMUNICATION', configKey: 'defaultEmailProvider', configValue: 'SMTP', defaultValue: 'SMTP', valueType: 'ENUM', displayName: 'Default Email Provider', groupName: 'Email', sortOrder: 1, enumOptions: ['SMTP', 'GMAIL', 'OUTLOOK', 'SENDGRID', 'MAILGUN'] },
    { category: 'COMMUNICATION', configKey: 'emailDailyLimit', configValue: '500', defaultValue: '500', valueType: 'INTEGER', displayName: 'Daily Email Limit', groupName: 'Email', sortOrder: 2, minValue: 10, maxValue: 50000 },
    { category: 'COMMUNICATION', configKey: 'whatsappDailyLimit', configValue: '1000', defaultValue: '1000', valueType: 'INTEGER', displayName: 'Daily WhatsApp Limit', groupName: 'WhatsApp', sortOrder: 3, minValue: 10, maxValue: 100000 },
    { category: 'COMMUNICATION', configKey: 'emailTrackingEnabled', configValue: 'true', defaultValue: 'true', valueType: 'BOOLEAN', displayName: 'Email Open Tracking', groupName: 'Email', sortOrder: 4 },
    { category: 'NOTIFICATION', configKey: 'notifyOnNewLead', configValue: 'true', defaultValue: 'true', valueType: 'BOOLEAN', displayName: 'Notify on New Lead', groupName: 'Lead Notifications', sortOrder: 1 },
    { category: 'NOTIFICATION', configKey: 'notifyOnLeadAssign', configValue: 'true', defaultValue: 'true', valueType: 'BOOLEAN', displayName: 'Notify on Lead Assignment', groupName: 'Lead Notifications', sortOrder: 2 },
    { category: 'NOTIFICATION', configKey: 'notifyOnDealWon', configValue: 'true', defaultValue: 'true', valueType: 'BOOLEAN', displayName: 'Notify on Deal Won', groupName: 'Deal Notifications', sortOrder: 3 },
    { category: 'NOTIFICATION', configKey: 'digestEmailEnabled', configValue: 'false', defaultValue: 'false', valueType: 'BOOLEAN', displayName: 'Daily Digest Email', groupName: 'Digest', sortOrder: 4 },
    { category: 'NOTIFICATION', configKey: 'digestRecipients', configValue: '[]', defaultValue: '[]', valueType: 'JSON', displayName: 'Digest Recipients', description: 'Array of email addresses', groupName: 'Digest', sortOrder: 5 },
    { category: 'SECURITY', configKey: 'sessionTimeoutMinutes', configValue: '480', defaultValue: '480', valueType: 'INTEGER', displayName: 'Session Timeout (Minutes)', groupName: 'Session', sortOrder: 1, minValue: 15, maxValue: 1440 },
    { category: 'SECURITY', configKey: 'maxLoginAttempts', configValue: '5', defaultValue: '5', valueType: 'INTEGER', displayName: 'Max Login Attempts', groupName: 'Authentication', sortOrder: 2, minValue: 3, maxValue: 20 },
    { category: 'SECURITY', configKey: 'passwordMinLength', configValue: '8', defaultValue: '8', valueType: 'INTEGER', displayName: 'Minimum Password Length', groupName: 'Password Policy', sortOrder: 3, minValue: 6, maxValue: 32 },
    { category: 'SECURITY', configKey: 'enforcePasswordComplexity', configValue: 'true', defaultValue: 'true', valueType: 'BOOLEAN', displayName: 'Enforce Password Complexity', description: 'Require uppercase, lowercase, number, and special character', groupName: 'Password Policy', sortOrder: 4 },
    { category: 'SECURITY', configKey: 'twoFactorEnabled', configValue: 'false', defaultValue: 'false', valueType: 'BOOLEAN', displayName: 'Enable Two-Factor Auth', groupName: 'Authentication', sortOrder: 5 },
    { category: 'DISPLAY', configKey: 'recordsPerPage', configValue: '25', defaultValue: '25', valueType: 'INTEGER', displayName: 'Records Per Page', groupName: 'Pagination', sortOrder: 1, minValue: 10, maxValue: 100 },
    { category: 'DISPLAY', configKey: 'defaultListView', configValue: 'TABLE', defaultValue: 'TABLE', valueType: 'ENUM', displayName: 'Default List View', groupName: 'Layout', sortOrder: 2, enumOptions: ['TABLE', 'CARD', 'KANBAN'] },
];
let ConfigSeederService = class ConfigSeederService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async seedDefaults(tenantId) {
        let seeded = 0;
        for (const cfg of SEED_CONFIGS) {
            await this.prisma.tenantConfig.upsert({
                where: {
                    tenantId_configKey: { tenantId, configKey: cfg.configKey },
                },
                create: {
                    tenantId,
                    category: cfg.category,
                    configKey: cfg.configKey,
                    configValue: cfg.configValue,
                    defaultValue: cfg.defaultValue,
                    valueType: cfg.valueType,
                    displayName: cfg.displayName,
                    description: cfg.description,
                    groupName: cfg.groupName,
                    sortOrder: cfg.sortOrder,
                    isRequired: cfg.isRequired ?? false,
                    isReadOnly: cfg.isReadOnly ?? false,
                    enumOptions: cfg.enumOptions ?? undefined,
                    minValue: cfg.minValue,
                    maxValue: cfg.maxValue,
                    validationRule: cfg.validationRule,
                },
                update: {},
            });
            seeded++;
        }
        return { seeded };
    }
};
exports.ConfigSeederService = ConfigSeederService;
exports.ConfigSeederService = ConfigSeederService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConfigSeederService);
//# sourceMappingURL=config-seeder.service.js.map