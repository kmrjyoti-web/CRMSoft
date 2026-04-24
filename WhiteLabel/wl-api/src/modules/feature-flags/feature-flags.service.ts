import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export const AVAILABLE_FEATURES = [
  { code: 'LEADS_MODULE', label: 'Leads Module', description: 'Lead tracking and pipeline management', category: 'CRM' },
  { code: 'CONTACTS_MODULE', label: 'Contacts Module', description: 'Contact management and enrichment', category: 'CRM' },
  { code: 'QUOTATIONS_MODULE', label: 'Quotations Module', description: 'Quotation and proposal creation', category: 'CRM' },
  { code: 'INVOICING_MODULE', label: 'Invoicing Module', description: 'GST invoicing and payment tracking', category: 'Finance' },
  { code: 'WHATSAPP_INTEGRATION', label: 'WhatsApp Integration', description: 'WhatsApp Business API messaging', category: 'Integrations' },
  { code: 'TALLY_INTEGRATION', label: 'Tally Integration', description: 'Tally ERP sync for accounting', category: 'Integrations' },
  { code: 'RAZORPAY_PAYMENTS', label: 'Razorpay Payments', description: 'Online payment collection via Razorpay', category: 'Payments' },
  { code: 'MARKETPLACE_ACCESS', label: 'Marketplace Access', description: 'Access to CRMSoft marketplace modules', category: 'Platform' },
  { code: 'PUJA_MODE', label: 'Puja Mode', description: 'Religious calendar and puja overlay feature', category: 'Platform' },
  { code: 'OFFLINE_SYNC', label: 'Offline Sync', description: 'Mobile app offline data synchronization', category: 'Mobile' },
  { code: 'ADVANCED_ANALYTICS', label: 'Advanced Analytics', description: 'Revenue forecasting and executive dashboards', category: 'Analytics' },
  { code: 'BULK_IMPORT', label: 'Bulk Import', description: 'CSV/Excel bulk data import', category: 'Data' },
  { code: 'API_GATEWAY', label: 'API Gateway', description: 'External API keys and webhook management', category: 'Developer' },
  { code: 'CUSTOM_FIELDS', label: 'Custom Fields', description: 'User-defined custom fields per entity', category: 'Customization' },
  { code: 'WORKFLOW_AUTOMATION', label: 'Workflow Automation', description: 'Automated approval and transition workflows', category: 'Automation' },
  { code: 'MULTI_CURRENCY', label: 'Multi-Currency', description: 'Multi-currency support for international clients', category: 'Finance' },
  { code: 'DOCUMENT_STORAGE', label: 'Document Storage', description: 'File attachments and document management', category: 'Storage' },
  { code: 'EMAIL_TRACKING', label: 'Email Tracking', description: 'Email open/click tracking for campaigns', category: 'Communications' },
  { code: 'SLA_MANAGEMENT', label: 'SLA Management', description: 'Service level agreement tracking and alerts', category: 'Support' },
  { code: 'WHITE_LABEL_BRANDING', label: 'White Label Branding', description: 'Custom logo, colors, and domain', category: 'Branding' },
];

@Injectable()
export class FeatureFlagsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  getAvailableFeatures() {
    return AVAILABLE_FEATURES;
  }

  async getByPartner(partnerId: string) {
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');

    const flags = await this.prisma.partnerFeatureFlag.findMany({ where: { partnerId } });
    const flagMap = new Map(flags.map((f) => [f.featureCode, f]));

    return AVAILABLE_FEATURES.map((feature) => {
      const flag = flagMap.get(feature.code);
      return {
        ...feature,
        isEnabled: flag?.isEnabled ?? false,
        config: flag?.config ?? null,
        flagId: flag?.id ?? null,
      };
    });
  }

  async getEnabled(partnerId: string) {
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');

    const flags = await this.prisma.partnerFeatureFlag.findMany({
      where: { partnerId, isEnabled: true },
    });
    return flags.map((f) => f.featureCode);
  }

  async toggle(partnerId: string, featureCode: string, isEnabled: boolean, config?: Record<string, unknown>, performedBy = 'admin') {
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');

    const feature = AVAILABLE_FEATURES.find((f) => f.code === featureCode);
    if (!feature) throw new NotFoundException(`Feature '${featureCode}' not found`);

    const flag = await this.prisma.partnerFeatureFlag.upsert({
      where: { partnerId_featureCode: { partnerId, featureCode } },
      create: { partnerId, featureCode, isEnabled, config: config as any },
      update: { isEnabled, ...(config !== undefined ? { config: config as any } : {}) },
    });

    await this.audit.log({
      partnerId,
      action: isEnabled ? 'FEATURE_ENABLED' : 'FEATURE_DISABLED',
      performedBy,
      performedByRole: 'MASTER_ADMIN',
      details: { featureCode, label: feature.label },
    });

    return flag;
  }

  async bulkSet(partnerId: string, features: { featureCode: string; isEnabled: boolean }[], performedBy = 'admin') {
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');

    const results = await Promise.all(
      features.map(({ featureCode, isEnabled }) => this.toggle(partnerId, featureCode, isEnabled, undefined, performedBy)),
    );

    return { updated: results.length, features: results };
  }

  async enableAll(partnerId: string, performedBy = 'admin') {
    const features = AVAILABLE_FEATURES.map((f) => ({ featureCode: f.code, isEnabled: true }));
    return this.bulkSet(partnerId, features, performedBy);
  }

  async disableAll(partnerId: string, performedBy = 'admin') {
    const features = AVAILABLE_FEATURES.map((f) => ({ featureCode: f.code, isEnabled: false }));
    return this.bulkSet(partnerId, features, performedBy);
  }

  async getDashboard() {
    const allFlags = await this.prisma.partnerFeatureFlag.findMany({ where: { isEnabled: true } });
    const byFeature = AVAILABLE_FEATURES.map((feature) => ({
      code: feature.code,
      label: feature.label,
      category: feature.category,
      enabledCount: allFlags.filter((f) => f.featureCode === feature.code).length,
    }));
    byFeature.sort((a, b) => b.enabledCount - a.enabledCount);
    return { byFeature, totalFlags: allFlags.length };
  }
}
