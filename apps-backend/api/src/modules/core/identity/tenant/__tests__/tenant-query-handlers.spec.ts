import { NotFoundException } from '@nestjs/common';
import { GetTenantByIdHandler } from '../application/queries/get-tenant-by-id/handler';
import { GetTenantByIdQuery } from '../application/queries/get-tenant-by-id/query';
import { ListTenantsHandler } from '../application/queries/list-tenants/handler';
import { ListTenantsQuery } from '../application/queries/list-tenants/query';
import { GetTenantDashboardHandler } from '../application/queries/get-tenant-dashboard/handler';
import { GetTenantDashboardQuery } from '../application/queries/get-tenant-dashboard/query';
import { GetTenantUsageHandler } from '../application/queries/get-tenant-usage/handler';
import { GetTenantUsageQuery } from '../application/queries/get-tenant-usage/query';
import { ListInvoicesHandler } from '../application/queries/list-invoices/handler';
import { ListInvoicesQuery } from '../application/queries/list-invoices/query';
import { GetPlanByIdHandler } from '../application/queries/get-plan-by-id/handler';
import { GetPlanByIdQuery } from '../application/queries/get-plan-by-id/query';
import { GetSubscriptionHandler } from '../application/queries/get-subscription/handler';
import { GetSubscriptionQuery } from '../application/queries/get-subscription/query';
import { ListPlansHandler } from '../application/queries/list-plans/handler';
import { ListPlansQuery } from '../application/queries/list-plans/query';
import { ListSuperAdminsHandler } from '../application/queries/list-super-admins/handler';
import { ListSuperAdminsQuery } from '../application/queries/list-super-admins/query';

const mockPlan = { id: 'p-1', name: 'Starter', code: 'STARTER', maxUsers: 10, maxContacts: 500, maxLeads: 500, maxProducts: 100, sortOrder: 0 };
const mockTenant = {
  id: 't-1', name: 'Test Corp', status: 'ACTIVE', onboardingStep: 'DONE',
  subscriptions: [{ id: 'sub-1', status: 'ACTIVE', plan: mockPlan }],
  usage: { tenantId: 't-1', usersCount: 3, contactsCount: 120, leadsCount: 45, productsCount: 10 },
};
const mockUsage = { tenantId: 't-1', usersCount: 3, contactsCount: 120, leadsCount: 45, productsCount: 10 };
const mockSubscription = { id: 'sub-1', tenantId: 't-1', planId: 'p-1', status: 'ACTIVE', plan: mockPlan };

const mockPrisma = {
  identity: {
    tenant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    tenantUsage: {
      findUnique: jest.fn(),
    },
    tenantInvoice: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    plan: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
    },
    superAdmin: {
      findMany: jest.fn(),
    },
  },
} as any;
(mockPrisma as any).identity = mockPrisma.identity;

describe('Tenant Query Handlers', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── GetTenantByIdHandler ───────────────────────────────────────────────────
  describe('GetTenantByIdHandler', () => {
    let handler: GetTenantByIdHandler;
    beforeEach(() => { handler = new GetTenantByIdHandler(mockPrisma); });

    it('should return tenant with subscriptions and usage', async () => {
      mockPrisma.identity.tenant.findUnique.mockResolvedValue(mockTenant);
      const result = await handler.execute(new GetTenantByIdQuery('t-1'));
      expect(result.id).toBe('t-1');
      expect(mockPrisma.identity.tenant.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 't-1' } }),
      );
    });

    it('should throw NotFoundException when tenant not found', async () => {
      mockPrisma.identity.tenant.findUnique.mockResolvedValue(null);
      await expect(handler.execute(new GetTenantByIdQuery('t-999'))).rejects.toThrow(NotFoundException);
    });
  });

  // ─── ListTenantsHandler ─────────────────────────────────────────────────────
  describe('ListTenantsHandler', () => {
    let handler: ListTenantsHandler;
    beforeEach(() => { handler = new ListTenantsHandler(mockPrisma); });

    it('should return paginated list of tenants', async () => {
      mockPrisma.identity.tenant.findMany.mockResolvedValue([mockTenant]);
      mockPrisma.identity.tenant.count.mockResolvedValue(1);
      const result = await handler.execute(new ListTenantsQuery(1, 10));
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should filter by status when provided', async () => {
      mockPrisma.identity.tenant.findMany.mockResolvedValue([mockTenant]);
      mockPrisma.identity.tenant.count.mockResolvedValue(1);
      await handler.execute(new ListTenantsQuery(1, 10, 'ACTIVE'));
      const findManyCall = mockPrisma.identity.tenant.findMany.mock.calls[0][0];
      expect(findManyCall.where.status).toBe('ACTIVE');
    });

    it('should apply search filter when provided', async () => {
      mockPrisma.identity.tenant.findMany.mockResolvedValue([]);
      mockPrisma.identity.tenant.count.mockResolvedValue(0);
      await handler.execute(new ListTenantsQuery(1, 10, undefined, 'TestCorp'));
      const findManyCall = mockPrisma.identity.tenant.findMany.mock.calls[0][0];
      expect(findManyCall.where.name).toEqual({ contains: 'TestCorp', mode: 'insensitive' });
    });

    it('should handle empty result', async () => {
      mockPrisma.identity.tenant.findMany.mockResolvedValue([]);
      mockPrisma.identity.tenant.count.mockResolvedValue(0);
      const result = await handler.execute(new ListTenantsQuery(1, 10));
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  // ─── GetTenantDashboardHandler ──────────────────────────────────────────────
  describe('GetTenantDashboardHandler', () => {
    let handler: GetTenantDashboardHandler;
    beforeEach(() => { handler = new GetTenantDashboardHandler(mockPrisma); });

    it('should return dashboard with plan and usage', async () => {
      mockPrisma.identity.tenant.findUnique.mockResolvedValue(mockTenant);
      const result = await handler.execute(new GetTenantDashboardQuery('t-1'));
      expect(result.tenant.name).toBe('Test Corp');
      expect(result.plan).not.toBeNull();
      expect(result.usage).not.toBeNull();
      expect(result.limits).not.toBeNull();
    });

    it('should return null plan when no active subscription', async () => {
      const tenantNoSub = { ...mockTenant, subscriptions: [] };
      mockPrisma.identity.tenant.findUnique.mockResolvedValue(tenantNoSub);
      const result = await handler.execute(new GetTenantDashboardQuery('t-1'));
      expect(result.plan).toBeNull();
      expect(result.limits).toBeNull();
    });

    it('should throw NotFoundException when tenant not found', async () => {
      mockPrisma.identity.tenant.findUnique.mockResolvedValue(null);
      await expect(handler.execute(new GetTenantDashboardQuery('t-999'))).rejects.toThrow(NotFoundException);
    });
  });

  // ─── GetTenantUsageHandler ──────────────────────────────────────────────────
  describe('GetTenantUsageHandler', () => {
    let handler: GetTenantUsageHandler;
    beforeEach(() => { handler = new GetTenantUsageHandler(mockPrisma); });

    it('should return usage record', async () => {
      mockPrisma.identity.tenantUsage.findUnique.mockResolvedValue(mockUsage);
      const result = await handler.execute(new GetTenantUsageQuery('t-1'));
      expect(result.usersCount).toBe(3);
    });

    it('should throw NotFoundException when no usage record', async () => {
      mockPrisma.identity.tenantUsage.findUnique.mockResolvedValue(null);
      await expect(handler.execute(new GetTenantUsageQuery('t-999'))).rejects.toThrow(NotFoundException);
    });
  });

  // ─── ListInvoicesHandler ────────────────────────────────────────────────────
  describe('ListInvoicesHandler', () => {
    let handler: ListInvoicesHandler;
    beforeEach(() => { handler = new ListInvoicesHandler(mockPrisma); });

    it('should return paginated invoices filtered by tenantId', async () => {
      const mockInv = { id: 'inv-1', tenantId: 't-1', status: 'PAID' };
      mockPrisma.identity.tenantInvoice.findMany.mockResolvedValue([mockInv]);
      mockPrisma.identity.tenantInvoice.count.mockResolvedValue(1);
      const result = await handler.execute(new ListInvoicesQuery('t-1', 1, 10));
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should include tenant isolation filter', async () => {
      mockPrisma.identity.tenantInvoice.findMany.mockResolvedValue([]);
      mockPrisma.identity.tenantInvoice.count.mockResolvedValue(0);
      await handler.execute(new ListInvoicesQuery('t-1', 1, 10));
      const where = mockPrisma.identity.tenantInvoice.findMany.mock.calls[0][0].where;
      expect(where.tenantId).toBe('t-1');
    });

    it('should filter by status when provided', async () => {
      mockPrisma.identity.tenantInvoice.findMany.mockResolvedValue([]);
      mockPrisma.identity.tenantInvoice.count.mockResolvedValue(0);
      await handler.execute(new ListInvoicesQuery('t-1', 1, 10, 'PAID'));
      const where = mockPrisma.identity.tenantInvoice.findMany.mock.calls[0][0].where;
      expect(where.status).toBe('PAID');
    });
  });

  // ─── GetPlanByIdHandler ─────────────────────────────────────────────────────
  describe('GetPlanByIdHandler', () => {
    let handler: GetPlanByIdHandler;
    beforeEach(() => { handler = new GetPlanByIdHandler(mockPrisma); });

    it('should return plan', async () => {
      mockPrisma.identity.plan.findUnique.mockResolvedValue(mockPlan);
      const result = await handler.execute(new GetPlanByIdQuery('p-1'));
      expect(result.id).toBe('p-1');
    });

    it('should throw NotFoundException when plan not found', async () => {
      mockPrisma.identity.plan.findUnique.mockResolvedValue(null);
      await expect(handler.execute(new GetPlanByIdQuery('p-999'))).rejects.toThrow(NotFoundException);
    });
  });

  // ─── GetSubscriptionHandler ─────────────────────────────────────────────────
  describe('GetSubscriptionHandler', () => {
    let handler: GetSubscriptionHandler;
    beforeEach(() => { handler = new GetSubscriptionHandler(mockPrisma); });

    it('should return active subscription with plan', async () => {
      mockPrisma.identity.subscription.findFirst.mockResolvedValue(mockSubscription);
      const result = await handler.execute(new GetSubscriptionQuery('t-1'));
      expect(result.id).toBe('sub-1');
      expect(result.plan).toBeDefined();
    });

    it('should filter by tenantId and active status', async () => {
      mockPrisma.identity.subscription.findFirst.mockResolvedValue(mockSubscription);
      await handler.execute(new GetSubscriptionQuery('t-1'));
      const where = mockPrisma.identity.subscription.findFirst.mock.calls[0][0].where;
      expect(where.tenantId).toBe('t-1');
      expect(where.status.in).toContain('ACTIVE');
    });

    it('should throw NotFoundException when no active subscription', async () => {
      mockPrisma.identity.subscription.findFirst.mockResolvedValue(null);
      await expect(handler.execute(new GetSubscriptionQuery('t-1'))).rejects.toThrow(NotFoundException);
    });
  });

  // ─── ListPlansHandler ───────────────────────────────────────────────────────
  describe('ListPlansHandler', () => {
    let handler: ListPlansHandler;
    beforeEach(() => { handler = new ListPlansHandler(mockPrisma); });

    it('should return all plans ordered by sortOrder', async () => {
      mockPrisma.identity.plan.findMany.mockResolvedValue([mockPlan]);
      const result = await handler.execute(new ListPlansQuery());
      expect(result).toHaveLength(1);
    });

    it('should filter by isActive when provided', async () => {
      mockPrisma.identity.plan.findMany.mockResolvedValue([mockPlan]);
      await handler.execute(new ListPlansQuery(true));
      const where = mockPrisma.identity.plan.findMany.mock.calls[0][0].where;
      expect(where.isActive).toBe(true);
    });

    it('should not filter by isActive when not provided', async () => {
      mockPrisma.identity.plan.findMany.mockResolvedValue([mockPlan]);
      await handler.execute(new ListPlansQuery());
      const where = mockPrisma.identity.plan.findMany.mock.calls[0][0].where;
      expect(where).not.toHaveProperty('isActive');
    });
  });

  // ─── ListSuperAdminsHandler ─────────────────────────────────────────────────
  describe('ListSuperAdminsHandler', () => {
    let handler: ListSuperAdminsHandler;
    beforeEach(() => { handler = new ListSuperAdminsHandler(mockPrisma); });

    it('should return super admins without passwords', async () => {
      mockPrisma.identity.superAdmin.findMany.mockResolvedValue([
        { id: 'sa-1', email: 'sa@crm.com', firstName: 'Super', lastName: 'Admin', isActive: true, lastLoginAt: null },
      ]);
      const result = await handler.execute(new ListSuperAdminsQuery());
      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('password');
    });

    it('should return empty array when no super admins', async () => {
      mockPrisma.identity.superAdmin.findMany.mockResolvedValue([]);
      const result = await handler.execute(new ListSuperAdminsQuery());
      expect(result).toHaveLength(0);
    });
  });
});
