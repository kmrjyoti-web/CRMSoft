import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const DEFAULT_PASSWORD = 'Test@123';
const SALT_ROUNDS = 12;

// ═══════════════════════════════════════════════════════
// TENANT DEFINITIONS
// ═══════════════════════════════════════════════════════

const DEMO_TENANTS = [
  {
    name: 'Sharma Enterprises Pvt Ltd',
    slug: 'sharma-enterprises',
    status: 'ACTIVE' as const,
    onboardingStep: 'COMPLETED' as const,
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
    status: 'ACTIVE' as const,
    onboardingStep: 'COMPLETED' as const,
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
    status: 'ACTIVE' as const,
    onboardingStep: 'COMPLETED' as const,
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

// ═══════════════════════════════════════════════════════
// ROLE DEFINITIONS (created per tenant)
// ═══════════════════════════════════════════════════════

const ROLE_TEMPLATES: Array<{
  name: string;
  displayName: string;
  description: string;
  level: number;
  isSystem: boolean;
  canManageLevels: number[];
  parentRoleName?: string;
}> = [
  // Admin level
  { name: 'SUPER_ADMIN', displayName: 'Super Admin', description: 'Full access', level: 0, isSystem: true, canManageLevels: [1, 2, 3, 4, 5, 6] },
  { name: 'ADMIN', displayName: 'Admin', description: 'Tenant admin', level: 1, isSystem: true, canManageLevels: [2, 3, 4, 5, 6] },

  // Management level
  { name: 'MANAGER', displayName: 'Manager', description: 'Team manager', level: 2, isSystem: false, canManageLevels: [3, 4, 5], parentRoleName: 'ADMIN' },
  { name: 'TEAM_LEAD', displayName: 'Team Lead', description: 'Team lead / supervisor', level: 3, isSystem: false, canManageLevels: [4, 5], parentRoleName: 'MANAGER' },

  // Sales level
  { name: 'SR_SALES_EXECUTIVE', displayName: 'Senior Sales Executive', description: 'Experienced sales person', level: 4, isSystem: false, canManageLevels: [], parentRoleName: 'TEAM_LEAD' },
  { name: 'SALES_EXECUTIVE', displayName: 'Sales Executive', description: 'Standard sales person', level: 4, isSystem: false, canManageLevels: [], parentRoleName: 'TEAM_LEAD' },
  { name: 'FIELD_SALES', displayName: 'Field Sales', description: 'Outdoor/field sales person', level: 4, isSystem: false, canManageLevels: [], parentRoleName: 'MANAGER' },
  { name: 'TELECALLER', displayName: 'Telecaller', description: 'Phone-based sales', level: 5, isSystem: false, canManageLevels: [], parentRoleName: 'TEAM_LEAD' },
  { name: 'MARKETING_STAFF', displayName: 'Marketing Staff', description: 'Marketing team', level: 4, isSystem: false, canManageLevels: [] },

  // Operations level
  { name: 'SUPPORT_AGENT', displayName: 'Support Agent', description: 'Customer support', level: 4, isSystem: false, canManageLevels: [] },
  { name: 'DATA_ENTRY', displayName: 'Data Entry', description: 'Data entry operator', level: 5, isSystem: false, canManageLevels: [] },
  { name: 'APPROVER', displayName: 'Approver', description: 'Approves quotations and requests', level: 3, isSystem: false, canManageLevels: [], parentRoleName: 'ADMIN' },
  { name: 'ACCOUNT_MANAGER', displayName: 'Account Manager', description: 'Post-sales / finance', level: 4, isSystem: false, canManageLevels: [] },

  // External
  { name: 'VENDOR', displayName: 'Vendor', description: 'Marketplace vendor/seller', level: 5, isSystem: false, canManageLevels: [] },
  { name: 'CUSTOMER', displayName: 'Customer', description: 'Customer portal access', level: 5, isSystem: false, canManageLevels: [] },
  { name: 'REFERRAL_PARTNER', displayName: 'Referral Partner', description: 'Business partner', level: 5, isSystem: false, canManageLevels: [] },
  { name: 'VIEWER', displayName: 'Viewer', description: 'Read-only access', level: 6, isSystem: false, canManageLevels: [] },
];

// ═══════════════════════════════════════════════════════
// USER DEFINITIONS PER TENANT
// ═══════════════════════════════════════════════════════

interface UserSeed {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleName: string;
  userType: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER' | 'REFERRAL_PARTNER';
  verificationStatus: 'UNVERIFIED' | 'PARTIALLY_VERIFIED' | 'FULLY_VERIFIED';
  registrationType: 'INDIVIDUAL' | 'BUSINESS';
  emailVerified: boolean;
  mobileVerified: boolean;
  companyName?: string;
  gstNumber?: string;
  gstVerified?: boolean;
  businessType?: string;
  reportsToEmail?: string; // resolved to reportingToId later
  employeeCode?: string;
}

// ─── SHARMA ENTERPRISES USERS ───
const SHARMA_USERS: UserSeed[] = [
  // Admin
  {
    email: 'rajesh@sharmaenterprises.com', firstName: 'Rajesh', lastName: 'Sharma',
    phone: '+919876500001', roleName: 'ADMIN', userType: 'ADMIN',
    verificationStatus: 'FULLY_VERIFIED', registrationType: 'BUSINESS',
    emailVerified: true, mobileVerified: true,
    companyName: 'Sharma Enterprises Pvt Ltd', gstNumber: '27AABCS1234A1Z5', gstVerified: true,
    employeeCode: 'SE-001',
  },
  // Sales Manager
  {
    email: 'priya.patel@sharmaenterprises.com', firstName: 'Priya', lastName: 'Patel',
    phone: '+919876500002', roleName: 'MANAGER', userType: 'EMPLOYEE',
    verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
    emailVerified: true, mobileVerified: true,
    reportsToEmail: 'rajesh@sharmaenterprises.com', employeeCode: 'SE-002',
  },
  // Senior Sales Executive
  {
    email: 'amit.kumar@sharmaenterprises.com', firstName: 'Amit', lastName: 'Kumar',
    phone: '+919876500003', roleName: 'SR_SALES_EXECUTIVE', userType: 'EMPLOYEE',
    verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
    emailVerified: true, mobileVerified: true,
    reportsToEmail: 'priya.patel@sharmaenterprises.com', employeeCode: 'SE-003',
  },
  // Sales Executives
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
  // Field Sales
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
  // Telecaller
  {
    email: 'divya.mishra@sharmaenterprises.com', firstName: 'Divya', lastName: 'Mishra',
    phone: '+919876500008', roleName: 'TELECALLER', userType: 'EMPLOYEE',
    verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
    emailVerified: true, mobileVerified: true,
    reportsToEmail: 'priya.patel@sharmaenterprises.com', employeeCode: 'SE-008',
  },
  // Support
  {
    email: 'kavita.joshi@sharmaenterprises.com', firstName: 'Kavita', lastName: 'Joshi',
    phone: '+919876500009', roleName: 'SUPPORT_AGENT', userType: 'EMPLOYEE',
    verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
    emailVerified: true, mobileVerified: true,
    reportsToEmail: 'rajesh@sharmaenterprises.com', employeeCode: 'SE-009',
  },
  // Data Entry
  {
    email: 'suresh.reddy@sharmaenterprises.com', firstName: 'Suresh', lastName: 'Reddy',
    phone: '+919876500010', roleName: 'DATA_ENTRY', userType: 'EMPLOYEE',
    verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
    emailVerified: true, mobileVerified: true,
    reportsToEmail: 'rajesh@sharmaenterprises.com', employeeCode: 'SE-010',
  },
  // Approver
  {
    email: 'anita.mehta@sharmaenterprises.com', firstName: 'Anita', lastName: 'Mehta',
    phone: '+919876500011', roleName: 'APPROVER', userType: 'EMPLOYEE',
    verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
    emailVerified: true, mobileVerified: true,
    reportsToEmail: 'rajesh@sharmaenterprises.com', employeeCode: 'SE-011',
  },
  // Accountant
  {
    email: 'mohan.das@sharmaenterprises.com', firstName: 'Mohan', lastName: 'Das',
    phone: '+919876500012', roleName: 'ACCOUNT_MANAGER', userType: 'EMPLOYEE',
    verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
    emailVerified: true, mobileVerified: true,
    reportsToEmail: 'rajesh@sharmaenterprises.com', employeeCode: 'SE-012',
  },
  // Vendors (marketplace)
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
  // Viewer (read-only)
  {
    email: 'viewer@sharmaenterprises.com', firstName: 'Audit', lastName: 'User',
    phone: '+919876500015', roleName: 'VIEWER', userType: 'EMPLOYEE',
    verificationStatus: 'FULLY_VERIFIED', registrationType: 'INDIVIDUAL',
    emailVerified: true, mobileVerified: true, employeeCode: 'SE-015',
  },
];

// ─── MUMBAI DISTRIBUTORS USERS ───
const MUMBAI_USERS: UserSeed[] = [
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

// ─── TECHSERVE SOLUTIONS USERS ───
const TECHSERVE_USERS: UserSeed[] = [
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

// ─── MARKETPLACE CUSTOMERS (in default tenant) ───
const MARKETPLACE_CUSTOMERS: UserSeed[] = [
  // B2B Customers (GST Verified)
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
  // B2C Customers (Individual)
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
  // Partially Verified
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
  // Unverified
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
  // Business pending GST verification
  {
    email: 'business.pending@gmail.com', firstName: 'Business', lastName: 'Pending',
    phone: '+919876800010', roleName: 'CUSTOMER', userType: 'CUSTOMER',
    verificationStatus: 'FULLY_VERIFIED', registrationType: 'BUSINESS',
    emailVerified: true, mobileVerified: true,
    companyName: 'Pending Business Co', gstNumber: '27AABCP9999F1Z9', gstVerified: false,
  },
];

// ═══════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════

export async function seedDemoData(prisma: PrismaClient) {
  console.log('\n🏢 Seeding Demo Data...');
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  // ─── STEP 1: Create Demo Tenants ───
  console.log('\n  📋 Creating demo tenants...');
  const tenantIds: Record<string, string> = {};

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

    // TenantProfile
    await prisma.tenantProfile.upsert({
      where: { tenantId: tenant.id },
      update: { ...t.profile, billingAddress: t.profile.billingAddress },
      create: { tenantId: tenant.id, ...t.profile, billingAddress: t.profile.billingAddress },
    });

    // Subscription
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

    // TenantUsage
    await prisma.tenantUsage.upsert({
      where: { tenantId: tenant.id },
      update: {},
      create: { tenantId: tenant.id, lastCalculated: new Date() },
    });

    console.log(`  ✅ ${t.name} (${t.slug}) → ${t.planCode}`);
  }

  // ─── STEP 2: Create Roles per Tenant ───
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

  // Also add new roles to default tenant if missing
  const defaultTenant = await prisma.tenant.findFirst({ where: { slug: 'default' } });
  if (defaultTenant) {
    const newRoles = ROLE_TEMPLATES.filter(r =>
      ['SR_SALES_EXECUTIVE', 'FIELD_SALES', 'DATA_ENTRY', 'APPROVER', 'VENDOR'].includes(r.name),
    );
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

  // ─── STEP 3: Create Users ───
  console.log('\n  📋 Creating demo users...');

  // Helper: create users for a tenant
  async function createTenantUsers(tenantId: string, users: UserSeed[], label: string) {
    // First pass: create all users (without reportingToId)
    const createdUsers = new Map<string, string>(); // email → userId

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
      } catch (err: any) {
        console.error(`  ❌ Failed: ${u.email} — ${err.message}`);
      }
    }

    // Second pass: set reporting hierarchy
    for (const u of users) {
      if (!u.reportsToEmail) continue;
      const userId = createdUsers.get(u.email);
      const managerId = createdUsers.get(u.reportsToEmail);
      if (userId && managerId) {
        await prisma.user.update({
          where: { id: userId },
          data: { reportingToId: managerId },
        });
      }
    }

    // Create CustomerProfiles for B2B customers/vendors
    for (const u of users) {
      if (u.registrationType !== 'BUSINESS' || !u.companyName) continue;
      if (u.userType !== 'CUSTOMER') continue;
      const userId = createdUsers.get(u.email);
      if (!userId) continue;

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

  // Create users per tenant
  if (tenantIds['sharma-enterprises']) {
    await createTenantUsers(tenantIds['sharma-enterprises'], SHARMA_USERS, 'Sharma Enterprises');
  }
  if (tenantIds['mumbai-distributors']) {
    await createTenantUsers(tenantIds['mumbai-distributors'], MUMBAI_USERS, 'Mumbai Distributors');
  }
  if (tenantIds['techserve-solutions']) {
    await createTenantUsers(tenantIds['techserve-solutions'], TECHSERVE_USERS, 'TechServe Solutions');
  }

  // Create marketplace customers in default tenant
  if (defaultTenant) {
    await createTenantUsers(defaultTenant.id, MARKETPLACE_CUSTOMERS, 'Marketplace Customers');
  }

  // ─── SUMMARY ───
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

// Export for testing
export { DEMO_TENANTS, ROLE_TEMPLATES, SHARMA_USERS, MUMBAI_USERS, TECHSERVE_USERS, MARKETPLACE_CUSTOMERS };
