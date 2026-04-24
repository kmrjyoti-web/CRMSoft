import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const services = [
  { serviceCode: 'AI_TOKENS', serviceName: 'AI Tokens', unitDescription: 'per 1,000 tokens', baseCostPerUnit: 10, defaultPartnerPrice: 12, defaultCustomerPrice: 15 },
  { serviceCode: 'WHATSAPP_MSG', serviceName: 'WhatsApp Messages', unitDescription: 'per message', baseCostPerUnit: 0.5, defaultPartnerPrice: 0.65, defaultCustomerPrice: 1.0 },
  { serviceCode: 'SMS', serviceName: 'SMS Messages', unitDescription: 'per message', baseCostPerUnit: 0.3, defaultPartnerPrice: 0.4, defaultCustomerPrice: 0.75 },
  { serviceCode: 'EMAIL_BULK', serviceName: 'Bulk Email', unitDescription: 'per 1,000 emails', baseCostPerUnit: 5, defaultPartnerPrice: 7, defaultCustomerPrice: 12 },
  { serviceCode: 'STORAGE_GB', serviceName: 'File Storage', unitDescription: 'per GB/month', baseCostPerUnit: 5, defaultPartnerPrice: 8, defaultCustomerPrice: 15 },
  { serviceCode: 'API_CALLS', serviceName: 'API Calls', unitDescription: 'per 10,000 calls', baseCostPerUnit: 2, defaultPartnerPrice: 3, defaultCustomerPrice: 5 },
];

async function main() {
  console.log('Seeding WhiteLabelDB...');

  // Seed service pricing tiers
  for (const s of services) {
    await prisma.servicePricingTier.upsert({
      where: { serviceCode: s.serviceCode },
      create: s,
      update: s,
    });
    console.log(`  ✅ Service: ${s.serviceName}`);
  }

  // Seed demo partner (for testing)
  const passwordHash = await bcrypt.hash('Partner@123', 10);
  await prisma.whiteLabelPartner.upsert({
    where: { email: 'demo@partnercrm.in' },
    create: {
      partnerCode: 'demo-partner',
      companyName: 'Demo Partner CRM',
      contactName: 'Demo Admin',
      email: 'demo@partnercrm.in',
      phone: '+919876543210',
      passwordHash,
      status: 'ACTIVE',
      plan: 'PROFESSIONAL',
      maxTenants: 50,
      onboardedAt: new Date(),
      branding: {
        create: {
          brandName: 'Demo Business Suite',
          tagline: 'Powered by CRMSoft',
          primaryColor: '#7C3AED',
          secondaryColor: '#A78BFA',
          accentColor: '#F59E0B',
          fontFamily: 'Poppins',
          supportEmail: 'support@partnercrm.in',
        },
      },
    },
    update: { status: 'ACTIVE' },
  });
  console.log('  ✅ Demo partner created');

  console.log('\n✅ Seed complete. 6 services + 1 demo partner.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
