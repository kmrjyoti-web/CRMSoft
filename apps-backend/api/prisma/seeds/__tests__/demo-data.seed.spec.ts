import {
  DEMO_TENANTS,
  ROLE_TEMPLATES,
  SHARMA_USERS,
  MUMBAI_USERS,
  TECHSERVE_USERS,
  MARKETPLACE_CUSTOMERS,
  seedDemoData,
} from '../demo-data.seed';

describe('Demo Data Seed', () => {
  // ═════════════════════════════════════════════════════
  // TENANT DEFINITIONS
  // ═════════════════════════════════════════════════════

  describe('DEMO_TENANTS', () => {
    it('should have 3 demo tenants', () => {
      expect(DEMO_TENANTS).toHaveLength(3);
    });

    it('should have unique slugs', () => {
      const slugs = DEMO_TENANTS.map(t => t.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it('should have Sharma Enterprises', () => {
      const sharma = DEMO_TENANTS.find(t => t.slug === 'sharma-enterprises');
      expect(sharma).toBeDefined();
      expect(sharma!.planCode).toBe('ENTERPRISE');
      expect(sharma!.status).toBe('ACTIVE');
      expect(sharma!.profile.gstin).toBe('27AABCS1234A1Z5');
    });

    it('should have Mumbai Distributors', () => {
      const mumbai = DEMO_TENANTS.find(t => t.slug === 'mumbai-distributors');
      expect(mumbai).toBeDefined();
      expect(mumbai!.planCode).toBe('BUSINESS');
    });

    it('should have TechServe Solutions', () => {
      const techserve = DEMO_TENANTS.find(t => t.slug === 'techserve-solutions');
      expect(techserve).toBeDefined();
      expect(techserve!.planCode).toBe('STARTER');
    });

    it('should have complete profiles', () => {
      for (const t of DEMO_TENANTS) {
        expect(t.profile.companyLegalName).toBeDefined();
        expect(t.profile.primaryContactName).toBeDefined();
        expect(t.profile.primaryContactEmail).toBeDefined();
        expect(t.profile.gstin).toBeDefined();
        expect(t.profile.billingAddress).toBeDefined();
        expect(t.profile.billingAddress.city).toBeDefined();
        expect(t.profile.billingAddress.state).toBeDefined();
      }
    });
  });

  // ═════════════════════════════════════════════════════
  // ROLE DEFINITIONS
  // ═════════════════════════════════════════════════════

  describe('ROLE_TEMPLATES', () => {
    it('should have 17 role templates', () => {
      expect(ROLE_TEMPLATES).toHaveLength(17);
    });

    it('should have unique names', () => {
      const names = ROLE_TEMPLATES.map(r => r.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it('should have SUPER_ADMIN at level 0', () => {
      const sa = ROLE_TEMPLATES.find(r => r.name === 'SUPER_ADMIN');
      expect(sa).toBeDefined();
      expect(sa!.level).toBe(0);
      expect(sa!.isSystem).toBe(true);
      expect(sa!.canManageLevels).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should have ADMIN at level 1', () => {
      const admin = ROLE_TEMPLATES.find(r => r.name === 'ADMIN');
      expect(admin!.level).toBe(1);
      expect(admin!.isSystem).toBe(true);
    });

    it('should have management roles at level 2-3', () => {
      const manager = ROLE_TEMPLATES.find(r => r.name === 'MANAGER');
      const teamLead = ROLE_TEMPLATES.find(r => r.name === 'TEAM_LEAD');
      const approver = ROLE_TEMPLATES.find(r => r.name === 'APPROVER');
      expect(manager!.level).toBe(2);
      expect(teamLead!.level).toBe(3);
      expect(approver!.level).toBe(3);
    });

    it('should have sales roles at level 4-5', () => {
      const salesExec = ROLE_TEMPLATES.find(r => r.name === 'SALES_EXECUTIVE');
      const fieldSales = ROLE_TEMPLATES.find(r => r.name === 'FIELD_SALES');
      const telecaller = ROLE_TEMPLATES.find(r => r.name === 'TELECALLER');
      expect(salesExec!.level).toBe(4);
      expect(fieldSales!.level).toBe(4);
      expect(telecaller!.level).toBe(5);
    });

    it('should have external roles at level 5+', () => {
      const vendor = ROLE_TEMPLATES.find(r => r.name === 'VENDOR');
      const customer = ROLE_TEMPLATES.find(r => r.name === 'CUSTOMER');
      const viewer = ROLE_TEMPLATES.find(r => r.name === 'VIEWER');
      expect(vendor!.level).toBe(5);
      expect(customer!.level).toBe(5);
      expect(viewer!.level).toBe(6);
    });

    it('should have new roles not in default set', () => {
      const newRoles = ['SR_SALES_EXECUTIVE', 'FIELD_SALES', 'DATA_ENTRY', 'APPROVER', 'VENDOR'];
      for (const name of newRoles) {
        expect(ROLE_TEMPLATES.find(r => r.name === name)).toBeDefined();
      }
    });
  });

  // ═════════════════════════════════════════════════════
  // USER DEFINITIONS
  // ═════════════════════════════════════════════════════

  describe('SHARMA_USERS', () => {
    it('should have 15 users', () => {
      expect(SHARMA_USERS).toHaveLength(15);
    });

    it('should have unique emails', () => {
      const emails = SHARMA_USERS.map(u => u.email);
      expect(new Set(emails).size).toBe(emails.length);
    });

    it('should have admin as first user', () => {
      const admin = SHARMA_USERS[0];
      expect(admin.email).toBe('rajesh@sharmaenterprises.com');
      expect(admin.roleName).toBe('ADMIN');
      expect(admin.userType).toBe('ADMIN');
      expect(admin.gstVerified).toBe(true);
      expect(admin.registrationType).toBe('BUSINESS');
    });

    it('should have reporting hierarchy', () => {
      const manager = SHARMA_USERS.find(u => u.email === 'priya.patel@sharmaenterprises.com');
      expect(manager!.reportsToEmail).toBe('rajesh@sharmaenterprises.com');

      const salesExec = SHARMA_USERS.find(u => u.email === 'neha.singh@sharmaenterprises.com');
      expect(salesExec!.reportsToEmail).toBe('priya.patel@sharmaenterprises.com');
    });

    it('should have a partially verified user', () => {
      const partial = SHARMA_USERS.find(u => u.verificationStatus === 'PARTIALLY_VERIFIED');
      expect(partial).toBeDefined();
      expect(partial!.email).toBe('rohit.sharma@sharmaenterprises.com');
      expect(partial!.emailVerified).toBe(true);
      expect(partial!.mobileVerified).toBe(false);
    });

    it('should have vendors with B2B verification', () => {
      const vendors = SHARMA_USERS.filter(u => u.roleName === 'VENDOR');
      expect(vendors).toHaveLength(2);
      for (const v of vendors) {
        expect(v.gstVerified).toBe(true);
        expect(v.registrationType).toBe('BUSINESS');
        expect(v.companyName).toBeDefined();
      }
    });

    it('should have employee codes for internal staff', () => {
      const employees = SHARMA_USERS.filter(u => u.employeeCode);
      expect(employees.length).toBeGreaterThanOrEqual(10);
    });

    it('should have all role types represented', () => {
      const roles = new Set(SHARMA_USERS.map(u => u.roleName));
      expect(roles.has('ADMIN')).toBe(true);
      expect(roles.has('MANAGER')).toBe(true);
      expect(roles.has('SR_SALES_EXECUTIVE')).toBe(true);
      expect(roles.has('SALES_EXECUTIVE')).toBe(true);
      expect(roles.has('FIELD_SALES')).toBe(true);
      expect(roles.has('TELECALLER')).toBe(true);
      expect(roles.has('SUPPORT_AGENT')).toBe(true);
      expect(roles.has('DATA_ENTRY')).toBe(true);
      expect(roles.has('APPROVER')).toBe(true);
      expect(roles.has('VENDOR')).toBe(true);
      expect(roles.has('VIEWER')).toBe(true);
    });
  });

  describe('MUMBAI_USERS', () => {
    it('should have 4 users', () => {
      expect(MUMBAI_USERS).toHaveLength(4);
    });

    it('should have unique emails', () => {
      const emails = MUMBAI_USERS.map(u => u.email);
      expect(new Set(emails).size).toBe(emails.length);
    });

    it('should have admin and sales roles', () => {
      const roles = MUMBAI_USERS.map(u => u.roleName);
      expect(roles).toContain('ADMIN');
      expect(roles).toContain('MANAGER');
      expect(roles).toContain('SALES_EXECUTIVE');
      expect(roles).toContain('FIELD_SALES');
    });
  });

  describe('TECHSERVE_USERS', () => {
    it('should have 2 users', () => {
      expect(TECHSERVE_USERS).toHaveLength(2);
    });

    it('should have admin and sales exec', () => {
      expect(TECHSERVE_USERS[0].roleName).toBe('ADMIN');
      expect(TECHSERVE_USERS[1].roleName).toBe('SALES_EXECUTIVE');
    });
  });

  describe('MARKETPLACE_CUSTOMERS', () => {
    it('should have 10 customers', () => {
      expect(MARKETPLACE_CUSTOMERS).toHaveLength(10);
    });

    it('should have unique emails', () => {
      const emails = MARKETPLACE_CUSTOMERS.map(u => u.email);
      expect(new Set(emails).size).toBe(emails.length);
    });

    it('should have B2B customers with GST', () => {
      const b2b = MARKETPLACE_CUSTOMERS.filter(u => u.registrationType === 'BUSINESS' && u.gstVerified);
      expect(b2b.length).toBeGreaterThanOrEqual(3);
      for (const c of b2b) {
        expect(c.companyName).toBeDefined();
        expect(c.gstNumber).toBeDefined();
      }
    });

    it('should have B2C customers', () => {
      const b2c = MARKETPLACE_CUSTOMERS.filter(u =>
        u.registrationType === 'INDIVIDUAL' && u.verificationStatus === 'FULLY_VERIFIED',
      );
      expect(b2c.length).toBeGreaterThanOrEqual(2);
    });

    it('should have partially verified users', () => {
      const partial = MARKETPLACE_CUSTOMERS.filter(u => u.verificationStatus === 'PARTIALLY_VERIFIED');
      expect(partial).toHaveLength(2);
    });

    it('should have unverified users', () => {
      const unverified = MARKETPLACE_CUSTOMERS.filter(u => u.verificationStatus === 'UNVERIFIED');
      expect(unverified).toHaveLength(2);
      for (const u of unverified) {
        expect(u.emailVerified).toBe(false);
        expect(u.mobileVerified).toBe(false);
      }
    });

    it('should have a business with pending GST verification', () => {
      const pending = MARKETPLACE_CUSTOMERS.find(u => u.email === 'business.pending@gmail.com');
      expect(pending).toBeDefined();
      expect(pending!.registrationType).toBe('BUSINESS');
      expect(pending!.gstVerified).toBe(false);
      expect(pending!.gstNumber).toBeDefined();
    });

    it('should all be CUSTOMER role and userType', () => {
      for (const c of MARKETPLACE_CUSTOMERS) {
        expect(c.roleName).toBe('CUSTOMER');
        expect(c.userType).toBe('CUSTOMER');
      }
    });
  });

  // ═══════════════════════════════════════════════════════
  // TOTAL COUNTS
  // ═══════════════════════════════════════════════════════

  describe('Total counts', () => {
    it('should have 31 total users across all sets', () => {
      const total = SHARMA_USERS.length + MUMBAI_USERS.length + TECHSERVE_USERS.length + MARKETPLACE_CUSTOMERS.length;
      expect(total).toBe(31);
    });

    it('should not have duplicate emails across tenant user sets', () => {
      const allEmails = [
        ...SHARMA_USERS.map(u => u.email),
        ...MUMBAI_USERS.map(u => u.email),
        ...TECHSERVE_USERS.map(u => u.email),
        ...MARKETPLACE_CUSTOMERS.map(u => u.email),
      ];
      expect(new Set(allEmails).size).toBe(allEmails.length);
    });
  });

  // ═══════════════════════════════════════════════════════
  // SEED FUNCTION
  // ═══════════════════════════════════════════════════════

  describe('seedDemoData', () => {
    it('should be a function', () => {
      expect(typeof seedDemoData).toBe('function');
    });
  });
});
