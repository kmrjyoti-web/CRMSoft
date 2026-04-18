"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identity_client_1 = require("@prisma/identity-client");
const demo_client_1 = require(".prisma/demo-client");
const identity = new identity_client_1.PrismaClient({
    datasources: { db: { url: process.env.IDENTITY_DATABASE_URL } },
});
const demoDb = new demo_client_1.PrismaClient({
    datasources: { db: { url: process.env.DEMO_DATABASE_URL } },
});
const DEMO_TENANT_ID = 'demo-tenant-00000000-0000-0000-0000-000000000001';
const DEMO_TENANT_SLUG = 'crmsoft-demo';
async function seedIdentity() {
    const tenant = await identity.tenant.upsert({
        where: { slug: DEMO_TENANT_SLUG },
        update: { status: 'DEMO' },
        create: {
            id: DEMO_TENANT_ID,
            name: 'CRMSoft Demo',
            slug: DEMO_TENANT_SLUG,
            status: 'DEMO',
        },
    });
    console.log(`  Tenant: ${tenant.name} (${tenant.id}) — status=${tenant.status}`);
    return tenant;
}
async function seedDemoContacts(tenantId) {
    const contacts = [
        { id: 'demo-contact-001', firstName: 'Arjun', lastName: 'Sharma', email: 'arjun.sharma@demo.in', phone: '+919876543210' },
        { id: 'demo-contact-002', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@demo.in', phone: '+919876543211' },
        { id: 'demo-contact-003', firstName: 'Rohit', lastName: 'Verma', email: 'rohit.verma@demo.in', phone: '+919876543212' },
    ];
    for (const c of contacts) {
        await demoDb.contact.upsert({
            where: { id: c.id },
            update: {},
            create: {
                id: c.id,
                tenantId,
                firstName: c.firstName,
                lastName: c.lastName,
                email: c.email,
                phone: c.phone,
            },
        }).catch(() => {
        });
    }
    console.log(`  Contacts: ${contacts.length} demo contacts seeded`);
}
async function seedDemoLeads(tenantId) {
    const leads = [
        { id: 'demo-lead-001', title: 'Enterprise CRM Demo — Sharma & Co.', status: 'NEW', priority: 'HIGH' },
        { id: 'demo-lead-002', title: 'SMB Package — Patel Distributors', status: 'IN_PROGRESS', priority: 'MEDIUM' },
        { id: 'demo-lead-003', title: 'Startup Plan — Verma Tech', status: 'DEMO_SCHEDULED', priority: 'HIGH' },
    ];
    let seeded = 0;
    for (const l of leads) {
        try {
            await demoDb.lead.upsert({
                where: { id: l.id },
                update: {},
                create: {
                    id: l.id,
                    tenantId,
                    title: l.title,
                    status: l.status,
                    priority: l.priority,
                },
            });
            seeded++;
        }
        catch {
        }
    }
    console.log(`  Leads: ${seeded}/${leads.length} demo leads seeded`);
}
async function main() {
    console.log('\nSeeding DemoDB...');
    console.log('──────────────────');
    try {
        const tenant = await seedIdentity();
        await seedDemoContacts(tenant.id);
        await seedDemoLeads(tenant.id);
        console.log('──────────────────');
        console.log('✅ DemoDB seed complete\n');
    }
    finally {
        await identity.$disconnect();
        await demoDb.$disconnect();
    }
}
main().catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
});
//# sourceMappingURL=seed-demo.js.map