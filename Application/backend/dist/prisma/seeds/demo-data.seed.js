"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MARKETPLACE_CUSTOMERS = exports.TECHSERVE_USERS = exports.MUMBAI_USERS = exports.SHARMA_USERS = exports.ROLE_TEMPLATES = exports.DEMO_TENANTS = void 0;
exports.seedDemoData = seedDemoData;
const bcrypt = require("bcrypt");
const workflow_lead_pipeline_seed_1 = require("./workflow-lead-pipeline.seed");
const workflow_demo_seed_1 = require("./workflow-demo.seed");
const workflow_tour_plan_seed_1 = require("./workflow-tour-plan.seed");
const workflow_quotation_seed_1 = require("./workflow-quotation.seed");
const workflow_sale_order_seed_1 = require("./workflow-sale-order.seed");
const workflow_delivery_challan_seed_1 = require("./workflow-delivery-challan.seed");
const workflow_credit_note_seed_1 = require("./workflow-credit-note.seed");
const DEFAULT_PASSWORD = 'Test@123';
const SALT_ROUNDS = 12;
const DEMO_TENANTS = [
    {
        name: 'Sharma Enterprises Pvt Ltd',
        slug: 'sharma-enterprises',
        status: 'ACTIVE',
        onboardingStep: 'COMPLETED',
        planCode: 'ENTERPRISE',
        profile: {
            companyLegalName: 'Sharma Enterprises Private Limited',
            industry: 'Industrial Equipment',
            website: 'https://sharmaenterprises.com',
            supportEmail: 'support@sharmaenterprises.com',
            primaryContactName: 'Rajesh Sharma',
            primaryContactEmail: 'rajesh@sharmaenterprises.com',
            primaryContactPhone: '+91-20-12345678',
            gstin: '27AABCS1234A1Z5',
            pan: 'AABCS1234A',
            billingAddress: {
                line1: '123, Industrial Area, Phase 2',
                city: 'Pune',
                state: 'Maharashtra',
                pincode: '411001',
                country: 'India',
            },
        },
    },
    {
        name: 'Mumbai Distributors',
        slug: 'mumbai-distributors',
        status: 'ACTIVE',
        onboardingStep: 'COMPLETED',
        planCode: 'BUSINESS',
        profile: {
            companyLegalName: 'Mumbai Distributors LLP',
            industry: 'FMCG Distribution',
            supportEmail: 'contact@mumbaidistributors.com',
            primaryContactName: 'Arun Desai',
            primaryContactEmail: 'arun@mumbaidistributors.com',
            primaryContactPhone: '+91-22-87654321',
            gstin: '27AABCM5678B1Z3',
            pan: 'AABCM5678B',
            billingAddress: {
                line1: '456, Commerce Center',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                country: 'India',
            },
        },
    },
    {
        name: 'TechServe Solutions',
        slug: 'techserve-solutions',
        status: 'ACTIVE',
        onboardingStep: 'COMPLETED',
        planCode: 'STARTER',
        profile: {
            companyLegalName: 'TechServe Solutions Pvt Ltd',
            industry: 'IT Services',
            website: 'https://techserve.in',
            supportEmail: 'hello@techserve.in',
            primaryContactName: 'Sanjay Kapoor',
            primaryContactEmail: 'sanjay@techserve.in',
            primaryContactPhone: '+91-80-11223344',
            gstin: '29AABCT9012C1Z1',
            pan: 'AABCT9012C',
            billingAddress: {
                line1: '789, Tech Park, Whitefield',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560066',
                country: 'India',
            },
        },
    },
];
exports.DEMO_TENANTS = DEMO_TENANTS;
const ROLE_TEMPLATES = [
    { name: 'SUPER_ADMIN', displayName: 'Super Admin', description: 'Full access', level: 0, isSystem: true, canManageLevels: [1, 2, 3, 4, 5, 6] },
    { name: 'ADMIN', displayName: 'Admin', description: 'Tenant admin', level: 1, isSystem: true, canManageLevels: [2, 3, 4, 5, 6] },
    { name: 'MANAGER', displayName: 'Manager', description: 'Team manager', level: 2, isSystem: false, canManageLevels: [3, 4, 5], parentRoleName: 'ADMIN' },
    { name: 'TEAM_LEAD', displayName: 'Team Lead', description: 'Team lead / supervisor', level: 3, isSystem: false, canManageLevels: [4, 5], parentRoleName: 'MANAGER' },
    { name: 'SR_SALES_EXECUTIVE', displayName: 'Senior Sales Executive', description: 'Experienced sales person', level: 4, isSystem: false, canManageLevels: [], parentRoleName: 'TEAM_LEAD' },
    { name: 'SALES_EXECUTIVE', displayName: 'Sales Executive', description: 'Standard sales person', level: 4, isSystem: false, canManageLevels: [], parentRoleName: 'TEAM_LEAD' },
    { name: 'FIELD_SALES', displayName: 'Field Sales', description: 'Outdoor/field sales person', level: 4, isSystem: false, canManageLevels: [], parentRoleName: 'MANAGER' },
    { name: 'TELECALLER', displayName: 'Telecaller', description: 'Phone-based sales', level: 5, isSystem: false, canManageLevels: [], parentRoleName: 'TEAM_LEAD' },
    { name: 'MARKETING_STAFF', displayName: 'Marketing Staff', description: 'Marketing team', level: 4, isSystem: false, canManageLevels: [] },
    { name: 'SUPPORT_AGENT', displayName: 'Support Agent', description: 'Customer support', level: 4, isSystem: false, canManageLevels: [] },
    { name: 'DATA_ENTRY', displayName: 'Data Entry', description: 'Data entry operator', level: 5, isSystem: false, canManageLevels: [] },
    { name: 'APPROVER', displayName: 'Approver', description: 'Approves quotations and requests', level: 3, isSystem: false, canManageLevels: [], parentRoleName: 'ADMIN' },
    { name: 'ACCOUNT_MANAGER', displayName: 'Account Manager', description: 'Post-sales / finance', level: 4, isSystem: false, canManageLevels: [] },
    { name: 'VENDOR', displayName: 'Vendor', description: 'Marketplace vendor/seller', level: 5, isSystem: false, canManageLevels: [] },
    { name: 'CUSTOMER', displayName: 'Customer', description: 'Customer portal access', level: 5, isSystem: false, canManageLevels: [] },
    { name: 'REFERRAL_PARTNER', displayName: 'Referral Partner', description: 'Business partner', level: 5, isSystem: false, canManageLevels: [] },
    { name: 'VIEWER', displayName: 'Viewer', description: 'Read-only access', level: 6, isSystem: false, canManageLevels: [] },
];
exports.ROLE_TEMPLATES = ROLE_TEMPLATES;
const SHARMA_USERS = [
    {
        email: 'rajesh@sharmaenterprises.com', firstName: 'Rajesh', lastName: 'Sharma',
        phone: '+919876500001', roleName: 'ADMIN', userType: 'ADMIN',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'BUSINESS',
        emailVerified: true, mobileVerified: true,
        companyName: 'Sharma Enterprises Pvt Ltd', gstNumber: '27AABCS1234A1Z5', gstVerified: true,
        employeeCode: 'SE-001',
    },
    {
        email: 'priya.patel@sharmaenterprises.com', firstName: 'Priya', lastName: 'Patel',
        phone: '+919876500002', roleName: 'MANAGER', userType: 'EMPLOYEE',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: true,
        reportsToEmail: 'rajesh@sharmaenterprises.com', employeeCode: 'SE-002',
    },
    {
        email: 'amit.kumar@sharmaenterprises.com', firstName: 'Amit', lastName: 'Kumar',
        phone: '+919876500003', roleName: 'SR_SALES_EXECUTIVE', userType: 'EMPLOYEE',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: true,
        reportsToEmail: 'priya.patel@sharmaenterprises.com', employeeCode: 'SE-003',
    },
    {
        email: 'neha.singh@sharmaenterprises.com', firstName: 'Neha', lastName: 'Singh',
        phone: '+919876500004', roleName: 'SALES_EXECUTIVE', userType: 'EMPLOYEE',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: true,
        reportsToEmail: 'priya.patel@sharmaenterprises.com', employeeCode: 'SE-004',
    },
    {
        email: 'ravi.verma@sharmaenterprises.com', firstName: 'Ravi', lastName: 'Verma',
        phone: '+919876500005', roleName: 'SALES_EXECUTIVE', userType: 'EMPLOYEE',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: true,
        reportsToEmail: 'priya.patel@sharmaenterprises.com', employeeCode: 'SE-005',
    },
    {
        email: 'rohit.sharma@sharmaenterprises.com', firstName: 'Rohit', lastName: 'Sharma',
        phone: '+919876500006', roleName: 'FIELD_SALES', userType: 'EMPLOYEE',
        verificationStatus: 'PARTIALLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: false,
        reportsToEmail: 'priya.patel@sharmaenterprises.com', employeeCode: 'SE-006',
    },
    {
        email: 'pooja.yadav@sharmaenterprises.com', firstName: 'Pooja', lastName: 'Yadav',
        phone: '+919876500007', roleName: 'FIELD_SALES', userType: 'EMPLOYEE',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: true,
        reportsToEmail: 'amit.kumar@sharmaenterprises.com', employeeCode: 'SE-007',
    },
    {
        email: 'divya.mishra@sharmaenterprises.com', firstName: 'Divya', lastName: 'Mishra',
        phone: '+919876500008', roleName: 'TELECALLER', userType: 'EMPLOYEE',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: true,
        reportsToEmail: 'priya.patel@sharmaenterprises.com', employeeCode: 'SE-008',
    },
    {
        email: 'kavita.joshi@sharmaenterprises.com', firstName: 'Kavita', lastName: 'Joshi',
        phone: '+919876500009', roleName: 'SUPPORT_AGENT', userType: 'EMPLOYEE',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: true,
        reportsToEmail: 'rajesh@sharmaenterprises.com', employeeCode: 'SE-009',
    },
    {
        email: 'suresh.reddy@sharmaenterprises.com', firstName: 'Suresh', lastName: 'Reddy',
        phone: '+919876500010', roleName: 'DATA_ENTRY', userType: 'EMPLOYEE',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: true,
        reportsToEmail: 'rajesh@sharmaenterprises.com', employeeCode: 'SE-010',
    },
    {
        email: 'anita.mehta@sharmaenterprises.com', firstName: 'Anita', lastName: 'Mehta',
        phone: '+919876500011', roleName: 'APPROVER', userType: 'EMPLOYEE',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: true,
        reportsToEmail: 'rajesh@sharmaenterprises.com', employeeCode: 'SE-011',
    },
    {
        email: 'mohan.das@sharmaenterprises.com', firstName: 'Mohan', lastName: 'Das',
        phone: '+919876500012', roleName: 'ACCOUNT_MANAGER', userType: 'EMPLOYEE',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: true,
        reportsToEmail: 'rajesh@sharmaenterprises.com', employeeCode: 'SE-012',
    },
    {
        email: 'vikram@vikramindustries.com', firstName: 'Vikram', lastName: 'Chauhan',
        phone: '+919876500013', roleName: 'VENDOR', userType: 'CUSTOMER',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'BUSINESS',
        emailVerified: true, mobileVerified: true,
        companyName: 'Vikram Industries', gstNumber: '27AABCV1111A1Z1', gstVerified: true,
        businessType: 'Manufacturer',
    },
    {
        email: 'contact@guptatraders.com', firstName: 'Ramesh', lastName: 'Gupta',
        phone: '+919876500014', roleName: 'VENDOR', userType: 'CUSTOMER',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'BUSINESS',
        emailVerified: true, mobileVerified: true,
        companyName: 'Gupta Traders', gstNumber: '27AABCG2222B1Z2', gstVerified: true,
        businessType: 'Wholesaler',
    },
    {
        email: 'viewer@sharmaenterprises.com', firstName: 'Audit', lastName: 'User',
        phone: '+919876500015', roleName: 'VIEWER', userType: 'EMPLOYEE',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: true, employeeCode: 'SE-015',
    },
];
exports.SHARMA_USERS = SHARMA_USERS;
const MUMBAI_USERS = [
    {
        email: 'arun@mumbaidistributors.com', firstName: 'Arun', lastName: 'Desai',
        phone: '+919876600001', roleName: 'ADMIN', userType: 'ADMIN',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'BUSINESS',
        emailVerified: true, mobileVerified: true,
        companyName: 'Mumbai Distributors', gstNumber: '27AABCM5678B1Z3', gstVerified: true,
        employeeCode: 'MD-001',
    },
    {
        email: 'meera.nair@mumbaidistributors.com', firstName: 'Meera', lastName: 'Nair',
        phone: '+919876600002', roleName: 'MANAGER', userType: 'EMPLOYEE',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: true,
        reportsToEmail: 'arun@mumbaidistributors.com', employeeCode: 'MD-002',
    },
    {
        email: 'deepak.jain@mumbaidistributors.com', firstName: 'Deepak', lastName: 'Jain',
        phone: '+919876600003', roleName: 'SALES_EXECUTIVE', userType: 'EMPLOYEE',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: true,
        reportsToEmail: 'meera.nair@mumbaidistributors.com', employeeCode: 'MD-003',
    },
    {
        email: 'kiran.patil@mumbaidistributors.com', firstName: 'Kiran', lastName: 'Patil',
        phone: '+919876600004', roleName: 'FIELD_SALES', userType: 'EMPLOYEE',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: true,
        reportsToEmail: 'meera.nair@mumbaidistributors.com', employeeCode: 'MD-004',
    },
];
exports.MUMBAI_USERS = MUMBAI_USERS;
const TECHSERVE_USERS = [
    {
        email: 'sanjay@techserve.in', firstName: 'Sanjay', lastName: 'Kapoor',
        phone: '+919876700001', roleName: 'ADMIN', userType: 'ADMIN',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'BUSINESS',
        emailVerified: true, mobileVerified: true,
        companyName: 'TechServe Solutions', gstNumber: '29AABCT9012C1Z1', gstVerified: true,
        employeeCode: 'TS-001',
    },
    {
        email: 'pooja.sharma@techserve.in', firstName: 'Pooja', lastName: 'Sharma',
        phone: '+919876700002', roleName: 'SALES_EXECUTIVE', userType: 'EMPLOYEE',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: true,
        reportsToEmail: 'sanjay@techserve.in', employeeCode: 'TS-002',
    },
];
exports.TECHSERVE_USERS = TECHSERVE_USERS;
const MARKETPLACE_CUSTOMERS = [
    {
        email: 'patel@patelhardware.com', firstName: 'Nitin', lastName: 'Patel',
        phone: '+919876800001', roleName: 'CUSTOMER', userType: 'CUSTOMER',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'BUSINESS',
        emailVerified: true, mobileVerified: true,
        companyName: 'Patel Hardware Store', gstNumber: '24AABCP3333C1Z3', gstVerified: true,
        businessType: 'Retailer',
    },
    {
        email: 'singh@singhelectronics.com', firstName: 'Harpreet', lastName: 'Singh',
        phone: '+919876800002', roleName: 'CUSTOMER', userType: 'CUSTOMER',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'BUSINESS',
        emailVerified: true, mobileVerified: true,
        companyName: 'Singh Electronics', gstNumber: '03AABCS4444D1Z4', gstVerified: true,
        businessType: 'Wholesaler',
    },
    {
        email: 'agarwal@agarwalwholesale.com', firstName: 'Sunil', lastName: 'Agarwal',
        phone: '+919876800003', roleName: 'CUSTOMER', userType: 'CUSTOMER',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'BUSINESS',
        emailVerified: true, mobileVerified: true,
        companyName: 'Agarwal Wholesale', gstNumber: '09AABCA5555E1Z5', gstVerified: true,
        businessType: 'Wholesaler',
    },
    {
        email: 'ramesh.kumar@gmail.com', firstName: 'Ramesh', lastName: 'Kumar',
        phone: '+919876800004', roleName: 'CUSTOMER', userType: 'CUSTOMER',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: true,
    },
    {
        email: 'sunita.devi@gmail.com', firstName: 'Sunita', lastName: 'Devi',
        phone: '+919876800005', roleName: 'CUSTOMER', userType: 'CUSTOMER',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: true,
    },
    {
        email: 'partialuser1@gmail.com', firstName: 'Partial', lastName: 'UserOne',
        phone: '+919876800006', roleName: 'CUSTOMER', userType: 'CUSTOMER',
        verificationStatus: 'PARTIALLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: true, mobileVerified: false,
    },
    {
        email: 'partialuser2@gmail.com', firstName: 'Partial', lastName: 'UserTwo',
        phone: '+919876800007', roleName: 'CUSTOMER', userType: 'CUSTOMER',
        verificationStatus: 'PARTIALLY_VERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: false, mobileVerified: true,
    },
    {
        email: 'newuser1@gmail.com', firstName: 'New', lastName: 'UserOne',
        phone: '+919876800008', roleName: 'CUSTOMER', userType: 'CUSTOMER',
        verificationStatus: 'UNVERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: false, mobileVerified: false,
    },
    {
        email: 'newuser2@gmail.com', firstName: 'New', lastName: 'UserTwo',
        phone: '+919876800009', roleName: 'CUSTOMER', userType: 'CUSTOMER',
        verificationStatus: 'UNVERIFIED', registrationType: 'INDIVIDUAL',
        emailVerified: false, mobileVerified: false,
    },
    {
        email: 'business.pending@gmail.com', firstName: 'Business', lastName: 'Pending',
        phone: '+919876800010', roleName: 'CUSTOMER', userType: 'CUSTOMER',
        verificationStatus: 'FULLY_VERIFIED', registrationType: 'BUSINESS',
        emailVerified: true, mobileVerified: true,
        companyName: 'Pending Business Co', gstNumber: '27AABCP9999F1Z9', gstVerified: false,
    },
];
exports.MARKETPLACE_CUSTOMERS = MARKETPLACE_CUSTOMERS;
async function seedDemoData(prisma) {
    console.log('\n🏢 Seeding Demo Data...');
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    console.log('\n  📋 Creating demo tenants...');
    const tenantIds = {};
    for (const t of DEMO_TENANTS) {
        const plan = await prisma.plan.findUnique({ where: { code: t.planCode } });
        if (!plan) {
            console.warn(`  ⚠️ Plan ${t.planCode} not found, skipping tenant ${t.slug}`);
            continue;
        }
        const tenant = await prisma.tenant.upsert({
            where: { slug: t.slug },
            update: { name: t.name, status: t.status },
            create: { name: t.name, slug: t.slug, status: t.status, onboardingStep: t.onboardingStep },
        });
        tenantIds[t.slug] = tenant.id;
        await prisma.tenantProfile.upsert({
            where: { tenantId: tenant.id },
            update: { ...t.profile, billingAddress: t.profile.billingAddress },
            create: { tenantId: tenant.id, ...t.profile, billingAddress: t.profile.billingAddress },
        });
        const existingSub = await prisma.subscription.findFirst({ where: { tenantId: tenant.id } });
        if (!existingSub) {
            await prisma.subscription.create({
                data: {
                    tenantId: tenant.id,
                    planId: plan.id,
                    status: 'ACTIVE',
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                },
            });
        }
        await prisma.tenantUsage.upsert({
            where: { tenantId: tenant.id },
            update: {},
            create: { tenantId: tenant.id, lastCalculated: new Date() },
        });
        console.log(`  ✅ ${t.name} (${t.slug}) → ${t.planCode}`);
    }
    console.log('\n  📋 Creating roles for demo tenants...');
    for (const [slug, tenantId] of Object.entries(tenantIds)) {
        for (const role of ROLE_TEMPLATES) {
            await prisma.role.upsert({
                where: { tenantId_name: { tenantId, name: role.name } },
                update: {
                    displayName: role.displayName,
                    level: role.level,
                    canManageLevels: role.canManageLevels,
                    parentRoleName: role.parentRoleName,
                },
                create: {
                    tenantId,
                    name: role.name,
                    displayName: role.displayName,
                    description: role.description,
                    isSystem: role.isSystem,
                    level: role.level,
                    canManageLevels: role.canManageLevels,
                    parentRoleName: role.parentRoleName,
                },
            });
        }
        console.log(`  ✅ ${ROLE_TEMPLATES.length} roles → ${slug}`);
    }
    const defaultTenant = await prisma.tenant.findFirst({ where: { slug: 'default' } });
    if (defaultTenant) {
        const newRoles = ROLE_TEMPLATES.filter(r => ['SR_SALES_EXECUTIVE', 'FIELD_SALES', 'DATA_ENTRY', 'APPROVER', 'VENDOR'].includes(r.name));
        for (const role of newRoles) {
            await prisma.role.upsert({
                where: { tenantId_name: { tenantId: defaultTenant.id, name: role.name } },
                update: {},
                create: {
                    tenantId: defaultTenant.id,
                    name: role.name,
                    displayName: role.displayName,
                    description: role.description,
                    level: role.level,
                    canManageLevels: role.canManageLevels,
                    parentRoleName: role.parentRoleName,
                },
            });
        }
        console.log(`  ✅ ${newRoles.length} new roles → default tenant`);
    }
    console.log('\n  📋 Assigning permissions to roles...');
    const allPermissions = await prisma.permission.findMany();
    const ADMIN_MODULES = allPermissions.map(p => p.id);
    const MANAGER_MODULES = ['contacts', 'raw_contacts', 'organizations', 'leads', 'activities', 'demos',
        'tour-plans', 'quotations', 'invoices', 'payments', 'installations', 'trainings', 'support-tickets',
        'communications', 'reports', 'dashboard', 'analytics', 'performance', 'follow-ups', 'reminders',
        'recurrence', 'calendar', 'products', 'product_pricing', 'custom_fields', 'wallet', 'notifications'];
    const SALES_MODULES = ['contacts', 'raw_contacts', 'organizations', 'leads', 'activities', 'demos',
        'tour-plans', 'quotations', 'follow-ups', 'reminders', 'recurrence', 'calendar', 'dashboard',
        'communications', 'products', 'product_pricing', 'notifications'];
    const SUPPORT_MODULES = ['contacts', 'organizations', 'support-tickets', 'communications',
        'installations', 'trainings', 'dashboard', 'calendar', 'notifications'];
    const VIEWER_MODULES = ['contacts', 'organizations', 'leads', 'activities', 'dashboard', 'analytics',
        'reports', 'products'];
    const VIEWER_ACTIONS = ['read', 'export'];
    for (const [slug, tenantId] of Object.entries(tenantIds)) {
        const tenantRoles = await prisma.role.findMany({ where: { tenantId } });
        for (const role of tenantRoles) {
            let permIds = [];
            if (role.name === 'ADMIN' || role.name === 'SUPER_ADMIN') {
                permIds = allPermissions.map(p => p.id);
            }
            else if (role.name === 'MANAGER' || role.name === 'TEAM_LEAD') {
                permIds = allPermissions
                    .filter(p => MANAGER_MODULES.includes(p.module))
                    .map(p => p.id);
            }
            else if (['SALES_EXECUTIVE', 'SR_SALES_EXECUTIVE', 'FIELD_SALES', 'TELECALLER', 'MARKETING_STAFF'].includes(role.name)) {
                permIds = allPermissions
                    .filter(p => SALES_MODULES.includes(p.module))
                    .map(p => p.id);
            }
            else if (['SUPPORT_AGENT', 'ACCOUNT_MANAGER'].includes(role.name)) {
                permIds = allPermissions
                    .filter(p => SUPPORT_MODULES.includes(p.module))
                    .map(p => p.id);
            }
            else if (role.name === 'VIEWER') {
                permIds = allPermissions
                    .filter(p => VIEWER_MODULES.includes(p.module) && VIEWER_ACTIONS.includes(p.action))
                    .map(p => p.id);
            }
            else if (role.name === 'DATA_ENTRY') {
                permIds = allPermissions
                    .filter(p => ['contacts', 'raw_contacts', 'organizations', 'leads', 'products'].includes(p.module) && ['create', 'read', 'update'].includes(p.action))
                    .map(p => p.id);
            }
            if (permIds.length > 0) {
                await prisma.rolePermission.deleteMany({ where: { tenantId, roleId: role.id } });
                await prisma.rolePermission.createMany({
                    data: permIds.map(pid => ({ tenantId, roleId: role.id, permissionId: pid })),
                    skipDuplicates: true,
                });
            }
        }
        console.log(`  ✅ Permissions assigned → ${slug}`);
        const autoNumberSequences = [
            { entityName: 'Lead', prefix: 'L', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' },
            { entityName: 'Contact', prefix: 'C', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' },
            { entityName: 'Organization', prefix: 'ORG', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' },
            { entityName: 'Quotation', prefix: 'QTN', formatPattern: '{PREFIX}/{YY}{MM}/{SEQ:4}', resetPolicy: 'MONTHLY' },
            { entityName: 'Invoice', prefix: 'INV', formatPattern: '{PREFIX}-{YYYY}-{MM}-{SEQ:4}', resetPolicy: 'YEARLY' },
            { entityName: 'Ticket', prefix: 'TKT', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' },
            { entityName: 'Activity', prefix: 'ACT', formatPattern: '{PREFIX}-{YYYY}{MM}{DD}-{SEQ:4}', resetPolicy: 'DAILY' },
            { entityName: 'Payment', prefix: 'PAY', formatPattern: 'PAY-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' },
            { entityName: 'Receipt', prefix: 'RCT', formatPattern: 'RCT-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' },
            { entityName: 'Refund', prefix: 'RFD', formatPattern: 'RFD-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' },
            { entityName: 'CreditNote', prefix: 'CN', formatPattern: 'CN-{YYYY}/{MM}-{SEQ:4}', resetPolicy: 'YEARLY' },
            { entityName: 'ProformaInvoice', prefix: 'PI', formatPattern: 'PI-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' },
            { entityName: 'SaleOrder', prefix: 'SO', formatPattern: 'SO-{YYYY}-{SEQ:4}', resetPolicy: 'YEARLY' },
            { entityName: 'DeliveryChallan', prefix: 'DC', formatPattern: 'DC-{YYYY}-{SEQ:4}', resetPolicy: 'YEARLY' },
            { entityName: 'SaleReturn', prefix: 'SR', formatPattern: 'SR-{YYYY}-{SEQ:4}', resetPolicy: 'YEARLY' },
            { entityName: 'DebitNote', prefix: 'DN', formatPattern: 'DN-{YYYY}-{SEQ:4}', resetPolicy: 'YEARLY' },
        ];
        for (const seq of autoNumberSequences) {
            await prisma.autoNumberSequence.upsert({
                where: { tenantId_entityName: { tenantId, entityName: seq.entityName } },
                update: {},
                create: {
                    tenantId,
                    entityName: seq.entityName,
                    prefix: seq.prefix,
                    formatPattern: seq.formatPattern,
                    currentSequence: 0,
                    seqPadding: 5,
                    startFrom: 1,
                    incrementBy: 1,
                    resetPolicy: seq.resetPolicy,
                    isActive: true,
                },
            });
        }
        console.log(`  ✅ Auto-number sequences seeded → ${slug}`);
    }
    console.log('\n  📋 Creating demo users...');
    async function createTenantUsers(tenantId, users, label) {
        const createdUsers = new Map();
        for (const u of users) {
            const role = await prisma.role.findFirst({
                where: { tenantId, name: u.roleName },
            });
            if (!role) {
                console.warn(`  ⚠️ Role ${u.roleName} not found for ${tenantId}`);
                continue;
            }
            try {
                const user = await prisma.user.upsert({
                    where: { tenantId_email: { tenantId, email: u.email } },
                    update: {
                        firstName: u.firstName,
                        lastName: u.lastName,
                        phone: u.phone,
                        roleId: role.id,
                        userType: u.userType,
                        verificationStatus: u.verificationStatus,
                        registrationType: u.registrationType,
                        emailVerified: u.emailVerified,
                        mobileVerified: u.mobileVerified,
                        companyName: u.companyName,
                        gstNumber: u.gstNumber,
                        gstVerified: u.gstVerified ?? false,
                        businessType: u.businessType,
                    },
                    create: {
                        tenantId,
                        email: u.email,
                        password: passwordHash,
                        firstName: u.firstName,
                        lastName: u.lastName,
                        phone: u.phone,
                        roleId: role.id,
                        userType: u.userType,
                        verificationStatus: u.verificationStatus,
                        registrationType: u.registrationType,
                        emailVerified: u.emailVerified,
                        mobileVerified: u.mobileVerified,
                        companyName: u.companyName,
                        gstNumber: u.gstNumber,
                        gstVerified: u.gstVerified ?? false,
                        businessType: u.businessType,
                        employeeCode: u.employeeCode,
                    },
                });
                createdUsers.set(u.email, user.id);
            }
            catch (err) {
                console.error(`  ❌ Failed: ${u.email} — ${err.message}`);
            }
        }
        for (const u of users) {
            if (!u.reportsToEmail)
                continue;
            const userId = createdUsers.get(u.email);
            const managerId = createdUsers.get(u.reportsToEmail);
            if (userId && managerId) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { reportingToId: managerId },
                });
            }
        }
        for (const u of users) {
            if (u.registrationType !== 'BUSINESS' || !u.companyName)
                continue;
            if (u.userType !== 'CUSTOMER')
                continue;
            const userId = createdUsers.get(u.email);
            if (!userId)
                continue;
            await prisma.customerProfile.upsert({
                where: { tenantId_userId: { tenantId, userId } },
                update: {},
                create: {
                    tenantId,
                    userId,
                    companyName: u.companyName,
                    gstNumber: u.gstNumber,
                    industry: u.businessType,
                },
            });
        }
        console.log(`  ✅ ${createdUsers.size} users → ${label}`);
        return createdUsers;
    }
    if (tenantIds['sharma-enterprises']) {
        await createTenantUsers(tenantIds['sharma-enterprises'], SHARMA_USERS, 'Sharma Enterprises');
    }
    if (tenantIds['mumbai-distributors']) {
        await createTenantUsers(tenantIds['mumbai-distributors'], MUMBAI_USERS, 'Mumbai Distributors');
    }
    if (tenantIds['techserve-solutions']) {
        await createTenantUsers(tenantIds['techserve-solutions'], TECHSERVE_USERS, 'TechServe Solutions');
    }
    if (defaultTenant) {
        await createTenantUsers(defaultTenant.id, MARKETPLACE_CUSTOMERS, 'Marketplace Customers');
    }
    console.log('\n  📊 Seeding workflows for demo tenants...');
    for (const t of DEMO_TENANTS) {
        const tenantId = tenantIds[t.slug];
        if (!tenantId)
            continue;
        const adminUser = await prisma.user.findFirst({
            where: { tenantId, role: { name: 'ADMIN' } },
            select: { id: true },
        });
        if (!adminUser) {
            console.warn(`  ⚠️ No admin user found for ${t.slug}, skipping workflows`);
            continue;
        }
        await (0, workflow_lead_pipeline_seed_1.seedLeadWorkflow)(prisma, adminUser.id, tenantId);
        await (0, workflow_demo_seed_1.seedDemoWorkflow)(prisma, adminUser.id, tenantId);
        await (0, workflow_tour_plan_seed_1.seedTourPlanWorkflow)(prisma, adminUser.id, tenantId);
        await (0, workflow_quotation_seed_1.seedQuotationWorkflow)(prisma, adminUser.id, tenantId);
        await (0, workflow_sale_order_seed_1.seedSaleOrderWorkflow)(prisma, adminUser.id, tenantId);
        await (0, workflow_delivery_challan_seed_1.seedDeliveryChallanWorkflow)(prisma, adminUser.id, tenantId);
        await (0, workflow_credit_note_seed_1.seedCreditNoteWorkflow)(prisma, adminUser.id, tenantId);
        console.log(`  ✅ 7 workflows seeded → ${t.slug}`);
    }
    const totalUsers = SHARMA_USERS.length + MUMBAI_USERS.length + TECHSERVE_USERS.length + MARKETPLACE_CUSTOMERS.length;
    console.log(`\n  🎉 Demo Data Complete: ${DEMO_TENANTS.length} tenants, ${totalUsers} users`);
    console.log('\n  📋 Key Test Accounts (all password: Test@123):');
    console.log('     Sharma Admin:     rajesh@sharmaenterprises.com');
    console.log('     Sales Manager:    priya.patel@sharmaenterprises.com');
    console.log('     Sales Executive:  neha.singh@sharmaenterprises.com');
    console.log('     Field Sales:      rohit.sharma@sharmaenterprises.com (partial)');
    console.log('     Vendor (B2B):     vikram@vikramindustries.com');
    console.log('     Mumbai Admin:     arun@mumbaidistributors.com');
    console.log('     TechServe Admin:  sanjay@techserve.in');
    console.log('     Customer (B2B):   patel@patelhardware.com');
    console.log('     Customer (B2C):   ramesh.kumar@gmail.com');
    console.log('     Unverified:       newuser1@gmail.com');
}
//# sourceMappingURL=demo-data.seed.js.map