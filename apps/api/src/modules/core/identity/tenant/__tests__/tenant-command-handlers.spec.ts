import { NotFoundException } from '@nestjs/common';
import { ActivateTenantHandler } from '../application/commands/activate-tenant/activate-tenant.handler';
import { ActivateTenantCommand } from '../application/commands/activate-tenant/activate-tenant.command';
import { SuspendTenantHandler } from '../application/commands/suspend-tenant/suspend-tenant.handler';
import { SuspendTenantCommand } from '../application/commands/suspend-tenant/suspend-tenant.command';
import { ChangePlanHandler } from '../application/commands/change-plan/change-plan.handler';
import { ChangePlanCommand } from '../application/commands/change-plan/change-plan.command';
import { CompleteOnboardingStepHandler } from '../application/commands/complete-onboarding-step/complete-onboarding-step.handler';
import { CompleteOnboardingStepCommand } from '../application/commands/complete-onboarding-step/complete-onboarding-step.command';
import { CreatePlanHandler } from '../application/commands/create-plan/create-plan.handler';
import { CreatePlanCommand } from '../application/commands/create-plan/create-plan.command';
import { DeactivatePlanHandler } from '../application/commands/deactivate-plan/deactivate-plan.handler';
import { DeactivatePlanCommand } from '../application/commands/deactivate-plan/deactivate-plan.command';
import { UpdatePlanHandler } from '../application/commands/update-plan/update-plan.handler';
import { UpdatePlanCommand } from '../application/commands/update-plan/update-plan.command';
import { UpdateTenantHandler } from '../application/commands/update-tenant/update-tenant.handler';
import { UpdateTenantCommand } from '../application/commands/update-tenant/update-tenant.command';
import { UpdateTenantSettingsHandler } from '../application/commands/update-tenant-settings/update-tenant-settings.handler';
import { UpdateTenantSettingsCommand } from '../application/commands/update-tenant-settings/update-tenant-settings.command';
import { RecordPaymentHandler } from '../application/commands/record-payment/record-payment.handler';
import { RecordPaymentCommand } from '../application/commands/record-payment/record-payment.command';
import { CreateSuperAdminHandler } from '../application/commands/create-super-admin/create-super-admin.handler';
import { CreateSuperAdminCommand } from '../application/commands/create-super-admin/create-super-admin.command';
import { CancelSubscriptionHandler } from '../application/commands/cancel-subscription/cancel-subscription.handler';
import { CancelSubscriptionCommand } from '../application/commands/cancel-subscription/cancel-subscription.command';
import { SubscribeHandler } from '../application/commands/subscribe/subscribe.handler';
import { SubscribeCommand } from '../application/commands/subscribe/subscribe.command';
import { GenerateInvoiceHandler } from '../application/commands/generate-invoice/generate-invoice.handler';
import { GenerateInvoiceCommand } from '../application/commands/generate-invoice/generate-invoice.command';
import { RecalculateUsageHandler } from '../application/commands/recalculate-usage/recalculate-usage.handler';
import { RecalculateUsageCommand } from '../application/commands/recalculate-usage/recalculate-usage.command';
import { CreateTenantHandler } from '../application/commands/create-tenant/create-tenant.handler';
import { CreateTenantCommand } from '../application/commands/create-tenant/create-tenant.command';

const mockTenant = { id: 't-1', name: 'Test Corp', status: 'ACTIVE', onboardingStep: 'DONE' };
const mockPlan = { id: 'p-1', name: 'Starter', code: 'STARTER', price: 999, maxUsers: 10, maxContacts: 500, maxLeads: 500, maxProducts: 100, maxStorage: 5120 };
const mockSubscription = { id: 'sub-1', tenantId: 't-1', planId: 'p-1', status: 'ACTIVE', gatewayId: 'rzp_sub_1' };
const mockInvoice = { id: 'inv-1', invoiceNumber: 'INV-2026-001', status: 'PAID' };

const mockPrisma = {
  identity: {
    tenant: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    plan: {
      create: jest.fn(),
      update: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    tenantInvoice: {
      update: jest.fn(),
    },
    superAdmin: {
      create: jest.fn(),
    },
  },
} as any;
(mockPrisma as any).identity = mockPrisma.identity;

describe('Tenant Command Handlers', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── ActivateTenantHandler ──────────────────────────────────────────────────
  describe('ActivateTenantHandler', () => {
    let handler: ActivateTenantHandler;
    beforeEach(() => { handler = new ActivateTenantHandler(mockPrisma); });

    it('should activate tenant and return updated record', async () => {
      mockPrisma.identity.tenant.update.mockResolvedValue({ ...mockTenant, status: 'ACTIVE' });
      const result = await handler.execute(new ActivateTenantCommand('t-1'));
      expect(result.status).toBe('ACTIVE');
      expect(mockPrisma.identity.tenant.update).toHaveBeenCalledWith({
        where: { id: 't-1' },
        data: { status: 'ACTIVE' },
      });
    });

    it('should propagate DB error', async () => {
      mockPrisma.identity.tenant.update.mockRejectedValue(new Error('DB error'));
      await expect(handler.execute(new ActivateTenantCommand('t-1'))).rejects.toThrow('DB error');
    });
  });

  // ─── SuspendTenantHandler ───────────────────────────────────────────────────
  describe('SuspendTenantHandler', () => {
    let handler: SuspendTenantHandler;
    beforeEach(() => { handler = new SuspendTenantHandler(mockPrisma); });

    it('should suspend tenant', async () => {
      mockPrisma.identity.tenant.update.mockResolvedValue({ ...mockTenant, status: 'SUSPENDED' });
      const result = await handler.execute(new SuspendTenantCommand('t-1'));
      expect(result.status).toBe('SUSPENDED');
    });

    it('should propagate DB error', async () => {
      mockPrisma.identity.tenant.update.mockRejectedValue(new Error('DB error'));
      await expect(handler.execute(new SuspendTenantCommand('t-1'))).rejects.toThrow();
    });
  });

  // ─── ChangePlanHandler ──────────────────────────────────────────────────────
  describe('ChangePlanHandler', () => {
    let handler: ChangePlanHandler;
    beforeEach(() => { handler = new ChangePlanHandler(mockPrisma); });

    it('should change plan for active subscription', async () => {
      mockPrisma.identity.subscription.findFirst.mockResolvedValue(mockSubscription);
      mockPrisma.identity.subscription.update.mockResolvedValue({ ...mockSubscription, planId: 'p-2' });
      const result = await handler.execute(new ChangePlanCommand('t-1', 'p-2'));
      expect(result.planId).toBe('p-2');
    });

    it('should throw NotFoundException when no active subscription', async () => {
      mockPrisma.identity.subscription.findFirst.mockResolvedValue(null);
      await expect(handler.execute(new ChangePlanCommand('t-1', 'p-2'))).rejects.toThrow(NotFoundException);
    });
  });

  // ─── CompleteOnboardingStepHandler ─────────────────────────────────────────
  describe('CompleteOnboardingStepHandler', () => {
    let handler: CompleteOnboardingStepHandler;
    beforeEach(() => { handler = new CompleteOnboardingStepHandler(mockPrisma); });

    it('should update onboarding step', async () => {
      mockPrisma.identity.tenant.update.mockResolvedValue({ ...mockTenant, onboardingStep: 'PROFILE' });
      const result = await handler.execute(new CompleteOnboardingStepCommand('t-1', 'PROFILE' as any));
      expect(result.onboardingStep).toBe('PROFILE');
    });

    it('should propagate error', async () => {
      mockPrisma.identity.tenant.update.mockRejectedValue(new Error('fail'));
      await expect(handler.execute(new CompleteOnboardingStepCommand('t-1', 'DONE' as any))).rejects.toThrow('fail');
    });
  });

  // ─── CreatePlanHandler ──────────────────────────────────────────────────────
  describe('CreatePlanHandler', () => {
    let handler: CreatePlanHandler;
    beforeEach(() => { handler = new CreatePlanHandler(mockPrisma); });

    it('should create plan with INR default currency', async () => {
      mockPrisma.identity.plan.create.mockResolvedValue({ ...mockPlan, currency: 'INR' });
      const result = await handler.execute(
        new CreatePlanCommand('Starter', 'STARTER', 'MONTHLY', 999, 10, 500, 500, 100, 5120, ['LEADS']),
      );
      expect(result.currency).toBe('INR');
      expect(mockPrisma.identity.plan.create).toHaveBeenCalledTimes(1);
    });

    it('should use provided currency when given', async () => {
      mockPrisma.identity.plan.create.mockResolvedValue({ ...mockPlan, currency: 'USD' });
      await handler.execute(
        new CreatePlanCommand('Pro', 'PRO', 'MONTHLY', 29, 50, 5000, 5000, 500, 10240, [], undefined, 'USD'),
      );
      const callArg = mockPrisma.identity.plan.create.mock.calls[0][0];
      expect(callArg.data.currency).toBe('USD');
    });

    it('should propagate DB error', async () => {
      mockPrisma.identity.plan.create.mockRejectedValue(new Error('Unique constraint'));
      await expect(
        handler.execute(new CreatePlanCommand('Starter', 'STARTER', 'MONTHLY', 999, 10, 500, 500, 100, 5120, [])),
      ).rejects.toThrow('Unique constraint');
    });
  });

  // ─── DeactivatePlanHandler ──────────────────────────────────────────────────
  describe('DeactivatePlanHandler', () => {
    let handler: DeactivatePlanHandler;
    beforeEach(() => { handler = new DeactivatePlanHandler(mockPrisma); });

    it('should deactivate plan', async () => {
      mockPrisma.identity.plan.update.mockResolvedValue({ ...mockPlan, isActive: false });
      const result = await handler.execute(new DeactivatePlanCommand('p-1'));
      expect(result.isActive).toBe(false);
      expect(mockPrisma.identity.plan.update).toHaveBeenCalledWith({
        where: { id: 'p-1' },
        data: { isActive: false },
      });
    });

    it('should propagate error', async () => {
      mockPrisma.identity.plan.update.mockRejectedValue(new Error('not found'));
      await expect(handler.execute(new DeactivatePlanCommand('p-999'))).rejects.toThrow();
    });
  });

  // ─── UpdatePlanHandler ──────────────────────────────────────────────────────
  describe('UpdatePlanHandler', () => {
    let handler: UpdatePlanHandler;
    beforeEach(() => { handler = new UpdatePlanHandler(mockPrisma); });

    it('should update plan fields', async () => {
      mockPrisma.identity.plan.update.mockResolvedValue({ ...mockPlan, name: 'Growth', price: 1999 });
      const result = await handler.execute(new UpdatePlanCommand('p-1', 'Growth', undefined, 1999));
      expect(result.name).toBe('Growth');
      expect(result.price).toBe(1999);
    });

    it('should only update provided fields', async () => {
      mockPrisma.identity.plan.update.mockResolvedValue(mockPlan);
      await handler.execute(new UpdatePlanCommand('p-1', 'NewName'));
      const callData = mockPrisma.identity.plan.update.mock.calls[0][0].data;
      expect(callData).toHaveProperty('name');
      expect(callData).not.toHaveProperty('price');
    });

    it('should propagate error', async () => {
      mockPrisma.identity.plan.update.mockRejectedValue(new Error('DB fail'));
      await expect(handler.execute(new UpdatePlanCommand('p-1'))).rejects.toThrow();
    });
  });

  // ─── UpdateTenantHandler ────────────────────────────────────────────────────
  describe('UpdateTenantHandler', () => {
    let handler: UpdateTenantHandler;
    beforeEach(() => { handler = new UpdateTenantHandler(mockPrisma); });

    it('should update tenant', async () => {
      mockPrisma.identity.tenant.update.mockResolvedValue({ ...mockTenant, name: 'New Corp' });
      const result = await handler.execute(new UpdateTenantCommand('t-1', 'New Corp'));
      expect(result.name).toBe('New Corp');
    });

    it('should only patch provided fields', async () => {
      mockPrisma.identity.tenant.update.mockResolvedValue(mockTenant);
      await handler.execute(new UpdateTenantCommand('t-1', undefined, 'newdomain.com'));
      const callData = mockPrisma.identity.tenant.update.mock.calls[0][0].data;
      expect(callData).toHaveProperty('domain');
      expect(callData).not.toHaveProperty('name');
    });
  });

  // ─── UpdateTenantSettingsHandler ────────────────────────────────────────────
  describe('UpdateTenantSettingsHandler', () => {
    let handler: UpdateTenantSettingsHandler;
    beforeEach(() => { handler = new UpdateTenantSettingsHandler(mockPrisma); });

    it('should update tenant settings', async () => {
      const settings = { timezone: 'Asia/Kolkata', currency: 'INR' };
      mockPrisma.identity.tenant.update.mockResolvedValue({ ...mockTenant, settings });
      const result = await handler.execute(new UpdateTenantSettingsCommand('t-1', settings));
      expect(result.settings).toEqual(settings);
    });

    it('should propagate error', async () => {
      mockPrisma.identity.tenant.update.mockRejectedValue(new Error('fail'));
      await expect(handler.execute(new UpdateTenantSettingsCommand('t-1', {}))).rejects.toThrow();
    });
  });

  // ─── RecordPaymentHandler ───────────────────────────────────────────────────
  describe('RecordPaymentHandler', () => {
    let handler: RecordPaymentHandler;
    beforeEach(() => { handler = new RecordPaymentHandler(mockPrisma); });

    it('should mark invoice as PAID', async () => {
      mockPrisma.identity.tenantInvoice.update.mockResolvedValue({ ...mockInvoice, status: 'PAID', paidAt: new Date() });
      const result = await handler.execute(new RecordPaymentCommand('t-1', 'inv-1', 'rzp_pay_123', 999));
      expect(result.status).toBe('PAID');
    });

    it('should propagate error when invoice not found', async () => {
      mockPrisma.identity.tenantInvoice.update.mockRejectedValue(new Error('Record not found'));
      await expect(handler.execute(new RecordPaymentCommand('t-1', 'inv-999', '', 999))).rejects.toThrow();
    });
  });

  // ─── CreateSuperAdminHandler ─────────────────────────────────────────────────
  describe('CreateSuperAdminHandler', () => {
    let handler: CreateSuperAdminHandler;
    beforeEach(() => { handler = new CreateSuperAdminHandler(mockPrisma); });

    it('should create super admin with hashed password', async () => {
      mockPrisma.identity.superAdmin.create.mockResolvedValue({
        id: 'sa-1', email: 'sa@crm.com', firstName: 'Super', lastName: 'Admin',
      });
      const result = await handler.execute(new CreateSuperAdminCommand('sa@crm.com', 'Admin@123', 'Super', 'Admin'));
      expect(result.id).toBe('sa-1');
      const savedData = mockPrisma.identity.superAdmin.create.mock.calls[0][0].data;
      expect(savedData.password).not.toBe('Admin@123');
      expect(savedData.password).toMatch(/^\$2/); // bcrypt hash
    });

    it('should propagate error on duplicate email', async () => {
      mockPrisma.identity.superAdmin.create.mockRejectedValue(new Error('Unique constraint'));
      await expect(
        handler.execute(new CreateSuperAdminCommand('dup@crm.com', 'Pass@123', 'A', 'B')),
      ).rejects.toThrow('Unique constraint');
    });
  });

  // ─── CancelSubscriptionHandler ───────────────────────────────────────────────
  describe('CancelSubscriptionHandler', () => {
    let handler: CancelSubscriptionHandler;
    let mockPaymentGateway: any;

    beforeEach(() => {
      mockPaymentGateway = { cancelSubscription: jest.fn().mockResolvedValue(undefined) };
      handler = new CancelSubscriptionHandler(mockPrisma, mockPaymentGateway);
    });

    it('should cancel subscription and call payment gateway if gatewayId present', async () => {
      mockPrisma.identity.subscription.findFirstOrThrow.mockResolvedValue(mockSubscription);
      mockPrisma.identity.subscription.update.mockResolvedValue({ ...mockSubscription, status: 'CANCELLED' });
      const result = await handler.execute(new CancelSubscriptionCommand('sub-1', 't-1'));
      expect(result.status).toBe('CANCELLED');
      expect(mockPaymentGateway.cancelSubscription).toHaveBeenCalledWith('rzp_sub_1');
    });

    it('should cancel without calling gateway if no gatewayId', async () => {
      mockPrisma.identity.subscription.findFirstOrThrow.mockResolvedValue({ ...mockSubscription, gatewayId: null });
      mockPrisma.identity.subscription.update.mockResolvedValue({ ...mockSubscription, status: 'CANCELLED' });
      await handler.execute(new CancelSubscriptionCommand('sub-1', 't-1'));
      expect(mockPaymentGateway.cancelSubscription).not.toHaveBeenCalled();
    });

    it('should propagate error when subscription not found', async () => {
      mockPrisma.identity.subscription.findFirstOrThrow.mockRejectedValue(new Error('Record not found'));
      await expect(handler.execute(new CancelSubscriptionCommand('sub-999', 't-1'))).rejects.toThrow();
    });
  });

  // ─── SubscribeHandler ────────────────────────────────────────────────────────
  describe('SubscribeHandler', () => {
    let handler: SubscribeHandler;
    let mockPaymentGateway: any;

    beforeEach(() => {
      mockPaymentGateway = { createSubscription: jest.fn().mockResolvedValue({ gatewayId: 'rzp_sub_new' }) };
      handler = new SubscribeHandler(mockPrisma, mockPaymentGateway);
    });

    it('should create subscription with gateway ID', async () => {
      mockPrisma.identity.subscription.create.mockResolvedValue({ ...mockSubscription, id: 'sub-new' });
      const result = await handler.execute(new SubscribeCommand('t-1', 'p-1'));
      expect(result.id).toBe('sub-new');
      expect(mockPaymentGateway.createSubscription).toHaveBeenCalledWith('t-1', 'p-1');
    });

    it('should propagate error when payment gateway fails', async () => {
      mockPaymentGateway.createSubscription.mockRejectedValue(new Error('Gateway timeout'));
      await expect(handler.execute(new SubscribeCommand('t-1', 'p-1'))).rejects.toThrow('Gateway timeout');
    });
  });

  // ─── GenerateInvoiceHandler ─────────────────────────────────────────────────
  describe('GenerateInvoiceHandler', () => {
    let handler: GenerateInvoiceHandler;
    let mockInvoiceGenerator: any;

    beforeEach(() => {
      mockInvoiceGenerator = { generate: jest.fn().mockResolvedValue({ id: 'inv-1', invoiceNumber: 'INV-2026-001' }) };
      handler = new GenerateInvoiceHandler(mockInvoiceGenerator);
    });

    it('should generate invoice', async () => {
      const result = await handler.execute(
        new GenerateInvoiceCommand('t-1', 'sub-1', new Date('2026-04-01'), new Date('2026-04-30'), 999, 180),
      );
      expect(result.invoiceNumber).toBe('INV-2026-001');
    });

    it('should propagate generator error', async () => {
      mockInvoiceGenerator.generate.mockRejectedValue(new Error('Generate failed'));
      await expect(
        handler.execute(new GenerateInvoiceCommand('t-1', 'sub-1', new Date(), new Date(), 999, 0)),
      ).rejects.toThrow('Generate failed');
    });
  });

  // ─── RecalculateUsageHandler ─────────────────────────────────────────────────
  describe('RecalculateUsageHandler', () => {
    let handler: RecalculateUsageHandler;
    let mockUsageTracker: any;

    beforeEach(() => {
      mockUsageTracker = { recalculate: jest.fn().mockResolvedValue(undefined) };
      handler = new RecalculateUsageHandler(mockUsageTracker);
    });

    it('should call recalculate with tenantId', async () => {
      await handler.execute(new RecalculateUsageCommand('t-1'));
      expect(mockUsageTracker.recalculate).toHaveBeenCalledWith('t-1');
    });

    it('should propagate error', async () => {
      mockUsageTracker.recalculate.mockRejectedValue(new Error('recalc failed'));
      await expect(handler.execute(new RecalculateUsageCommand('t-1'))).rejects.toThrow('recalc failed');
    });
  });

  // ─── CreateTenantHandler ─────────────────────────────────────────────────────
  describe('CreateTenantHandler', () => {
    let handler: CreateTenantHandler;
    let mockProvisioningService: any;

    beforeEach(() => {
      mockProvisioningService = {
        provision: jest.fn().mockResolvedValue({ tenant: { id: 't-new', name: 'New Corp' } }),
      };
      handler = new CreateTenantHandler(mockProvisioningService);
    });

    it('should create tenant via provisioning service', async () => {
      const result = await handler.execute(
        new CreateTenantCommand('New Corp', 'new-corp', 'admin@new.com', 'Admin@123', 'Raj', 'Patel', 'p-1'),
      );
      expect(result.tenant.id).toBe('t-new');
      expect(mockProvisioningService.provision).toHaveBeenCalledTimes(1);
    });

    it('should hash password before provisioning', async () => {
      await handler.execute(
        new CreateTenantCommand('Corp', 'corp', 'a@b.com', 'Pass@123', 'A', 'B', 'p-1'),
      );
      const callArg = mockProvisioningService.provision.mock.calls[0][0];
      expect(callArg.adminPassword).not.toBe('Pass@123');
      expect(callArg.adminPassword).toMatch(/^\$2/);
    });

    it('should propagate provisioning error', async () => {
      mockProvisioningService.provision.mockRejectedValue(new Error('Provisioning failed'));
      await expect(
        handler.execute(new CreateTenantCommand('Corp', 'corp', 'a@b.com', 'P', 'A', 'B', 'p-1')),
      ).rejects.toThrow('Provisioning failed');
    });
  });
});
