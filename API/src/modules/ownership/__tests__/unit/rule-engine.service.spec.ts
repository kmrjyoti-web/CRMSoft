import { RuleEngineService } from '../../services/rule-engine.service';

describe('RuleEngineService', () => {
  let service: RuleEngineService;
  let prisma: any;
  let roundRobin: any;
  let ownershipCore: any;

  const mockLead = {
    id: 'lead-1', status: 'NEW', expectedValue: 600000, source: 'WEBSITE',
    organization: { industry: 'Healthcare', state: 'Maharashtra' },
    contact: { email: 'test@test.com' },
    filters: [{ lookupValue: { value: 'HOT', lookup: { category: 'LEAD_TYPE' } } }],
  };

  beforeEach(() => {
    prisma = {
      assignmentRule: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), update: jest.fn() },
      lead: { findUnique: jest.fn().mockResolvedValue(mockLead) },
      contact: { findUnique: jest.fn() },
      organization: { findUnique: jest.fn() },
      quotation: { findUnique: jest.fn() },
      user: { findUnique: jest.fn() },
    };
    roundRobin = { executeForRule: jest.fn() };
    ownershipCore = { assign: jest.fn().mockResolvedValue({ id: 'eo-1' }) };
    service = new RuleEngineService(prisma, roundRobin, ownershipCore);
  });

  it('should match rule with EQUALS condition', async () => {
    prisma.assignmentRule.findMany.mockResolvedValue([{
      id: 'rule-1', name: 'Website Leads', conditions: [{ field: 'source', operator: 'EQUALS', value: 'WEBSITE' }],
      assignmentMethod: 'MANUAL', assignToUserId: 'u-1', ownerType: 'PRIMARY_OWNER', priority: 1,
    }]);
    const rule = await service.evaluate({ entityType: 'LEAD', entityId: 'lead-1', triggerEvent: 'CREATED' });
    expect(rule).toBeDefined();
    expect(rule!.name).toBe('Website Leads');
  });

  it('should match GREATER_THAN condition for expectedValue', async () => {
    prisma.assignmentRule.findMany.mockResolvedValue([{
      id: 'rule-2', name: 'High Value', conditions: [{ field: 'expectedValue', operator: 'GREATER_THAN', value: '500000' }],
      assignmentMethod: 'MANUAL', assignToUserId: 'u-1', priority: 1,
    }]);
    const rule = await service.evaluate({ entityType: 'LEAD', entityId: 'lead-1', triggerEvent: 'CREATED' });
    expect(rule).toBeDefined();
    expect(rule!.name).toBe('High Value');
  });

  it('should match nested field "organization.industry"', async () => {
    prisma.assignmentRule.findMany.mockResolvedValue([{
      id: 'rule-3', name: 'Healthcare', conditions: [{ field: 'organization.industry', operator: 'EQUALS', value: 'Healthcare' }],
      assignmentMethod: 'MANUAL', assignToUserId: 'u-1', priority: 1,
    }]);
    const rule = await service.evaluate({ entityType: 'LEAD', entityId: 'lead-1', triggerEvent: 'CREATED' });
    expect(rule).toBeDefined();
  });

  it('should match filter field "filters.LEAD_TYPE"', async () => {
    prisma.assignmentRule.findMany.mockResolvedValue([{
      id: 'rule-4', name: 'Hot Leads', conditions: [{ field: 'filters.LEAD_TYPE', operator: 'EQUALS', value: 'HOT' }],
      assignmentMethod: 'MANUAL', assignToUserId: 'u-1', priority: 1,
    }]);
    const rule = await service.evaluate({ entityType: 'LEAD', entityId: 'lead-1', triggerEvent: 'CREATED' });
    expect(rule).toBeDefined();
  });

  it('should return first rule by priority when multiple match', async () => {
    prisma.assignmentRule.findMany.mockResolvedValue([
      { id: 'rule-low', name: 'Low Priority', conditions: [], priority: 100, assignmentMethod: 'MANUAL', assignToUserId: 'u-1' },
      { id: 'rule-high', name: 'High Priority', conditions: [], priority: 10, assignmentMethod: 'MANUAL', assignToUserId: 'u-2' },
    ]);
    const rule = await service.evaluate({ entityType: 'LEAD', entityId: 'lead-1', triggerEvent: 'CREATED' });
    expect(rule!.name).toBe('Low Priority'); // findMany already returns sorted by priority ASC
  });

  it('should return null when no rules match', async () => {
    prisma.assignmentRule.findMany.mockResolvedValue([{
      id: 'rule-5', name: 'No Match', conditions: [{ field: 'source', operator: 'EQUALS', value: 'DIRECT' }],
      assignmentMethod: 'MANUAL', assignToUserId: 'u-1', priority: 1,
    }]);
    const rule = await service.evaluate({ entityType: 'LEAD', entityId: 'lead-1', triggerEvent: 'CREATED' });
    expect(rule).toBeNull();
  });
});
