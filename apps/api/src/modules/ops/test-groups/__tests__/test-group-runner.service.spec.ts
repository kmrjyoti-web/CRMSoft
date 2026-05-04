import { TestGroupRunnerService } from '../application/services/test-group-runner.service';

const mockPrisma = {
  platform: {
    testGroupExecution: {
      update: jest.fn().mockResolvedValue({}),
    },
    testGroup: {
      update: jest.fn().mockResolvedValue({}),
    },
  },
};

function buildService() {
  return new TestGroupRunnerService(mockPrisma as any);
}

describe('TestGroupRunnerService', () => {
  afterEach(() => jest.clearAllMocks());

  // --- resolveTemplateVars ---

  describe('resolveTemplateVars', () => {
    it('should replace {{key}} placeholders from savedValues', () => {
      const service = buildService();
      const result = service.resolveTemplateVars(
        { contactId: '{{contactId}}', amount: 100 },
        { contactId: 'abc-123' },
      );
      expect(result).toEqual({ contactId: 'abc-123', amount: 100 });
    });

    it('should leave unresolved keys as-is', () => {
      const service = buildService();
      const result = service.resolveTemplateVars({ id: '{{missing}}' }, {});
      expect(result).toEqual({ id: '{{missing}}' });
    });

    it('should handle string endpoints', () => {
      const service = buildService();
      const result = service.resolveTemplateVars(
        'GET /api/v1/invoices/{{invoiceId}}',
        { invoiceId: 'inv-999' },
      );
      expect(result).toBe('GET /api/v1/invoices/inv-999');
    });

    it('should return null/undefined as-is', () => {
      const service = buildService();
      expect(service.resolveTemplateVars(null, {})).toBeNull();
      expect(service.resolveTemplateVars(undefined, {})).toBeUndefined();
    });
  });

  // --- evaluateAssertion ---

  describe('evaluateAssertion', () => {
    let service: TestGroupRunnerService;
    beforeEach(() => { service = buildService(); });

    it('eq / neq', () => {
      expect(service.evaluateAssertion(200, 'eq', 200)).toBe(true);
      expect(service.evaluateAssertion(200, 'eq', 201)).toBe(false);
      expect(service.evaluateAssertion(200, 'neq', 500)).toBe(true);
    });

    it('gt / gte / lt / lte', () => {
      expect(service.evaluateAssertion(5, 'gt', 3)).toBe(true);
      expect(service.evaluateAssertion(5, 'gte', 5)).toBe(true);
      expect(service.evaluateAssertion(2, 'lt', 5)).toBe(true);
      expect(service.evaluateAssertion(5, 'lte', 5)).toBe(true);
      expect(service.evaluateAssertion(5, 'gt', 5)).toBe(false);
    });

    it('exists / not_exists', () => {
      expect(service.evaluateAssertion('abc', 'exists', undefined)).toBe(true);
      expect(service.evaluateAssertion(null, 'exists', undefined)).toBe(false);
      expect(service.evaluateAssertion(null, 'not_exists', undefined)).toBe(true);
      expect(service.evaluateAssertion('abc', 'not_exists', undefined)).toBe(false);
    });

    it('contains', () => {
      expect(service.evaluateAssertion('hello world', 'contains', 'world')).toBe(true);
      expect(service.evaluateAssertion('hello world', 'contains', 'xyz')).toBe(false);
    });

    it('matches (regex)', () => {
      expect(service.evaluateAssertion('test@example.com', 'matches', '@example\\.com')).toBe(true);
      expect(service.evaluateAssertion('test@other.com', 'matches', '@example\\.com')).toBe(false);
    });

    it('in array', () => {
      expect(service.evaluateAssertion(200, 'in', [200, 201])).toBe(true);
      expect(service.evaluateAssertion(500, 'in', [200, 201])).toBe(false);
    });

    it('type check', () => {
      expect(service.evaluateAssertion({}, 'type', 'object')).toBe(true);
      expect(service.evaluateAssertion('str', 'type', 'string')).toBe(true);
      expect(service.evaluateAssertion(42, 'type', 'string')).toBe(false);
    });

    it('unknown operator returns false', () => {
      expect(service.evaluateAssertion('x', 'unknown_op', 'x')).toBe(false);
    });
  });

  // --- executeStep ---

  describe('executeStep', () => {
    it('should return ERROR status when fetch throws', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Connection refused'));
      const service = buildService();

      const step = {
        id: 'step-01',
        name: 'Create Contact',
        endpoint: 'POST /api/v1/contacts',
        requestBody: { firstName: 'Test' },
        assertions: [],
      };

      const result = await service.executeStep(step, {}, 'mock-token');

      expect(result.status).toBe('ERROR');
      expect(result.errorMessage).toContain('Connection refused');
      expect(result.stepId).toBe('step-01');
    });

    it('should evaluate assertions and mark PASS when all pass', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 201,
        json: async () => ({ data: { id: 'new-id-123' } }),
      } as any);
      const service = buildService();

      const step = {
        id: 'step-02',
        name: 'Create Item',
        endpoint: 'POST /api/v1/items',
        requestBody: { name: 'Test' },
        assertions: [
          { field: 'status', operator: 'eq', expected: 201 },
          { field: 'body.data.id', operator: 'exists' },
        ],
        saveAs: { createdId: 'body.data.id' },
      };

      const result = await service.executeStep(step, {}, 'mock-token');

      expect(result.status).toBe('PASS');
      expect(result.savedValues?.createdId).toBe('new-id-123');
    });

    it('should mark FAIL when an assertion fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 500,
        json: async () => ({ error: 'Internal Server Error' }),
      } as any);
      const service = buildService();

      const step = {
        id: 'step-03',
        name: 'Should Return 201',
        endpoint: 'POST /api/v1/items',
        requestBody: {},
        assertions: [{ field: 'status', operator: 'eq', expected: 201 }],
      };

      const result = await service.executeStep(step, {}, 'mock-token');

      expect(result.status).toBe('FAIL');
      expect(result.errorMessage).toContain('assertion');
    });
  });

  // --- execute (dependency skip) ---

  describe('execute — dependency skip', () => {
    it('should skip steps whose dependency failed', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      const service = buildService();

      const group = {
        id: 'group-001',
        name: 'Test Group',
        steps: [
          {
            id: 'step-A',
            name: 'Step A',
            endpoint: 'POST /api/v1/contacts',
            requestBody: {},
            assertions: [],
          },
          {
            id: 'step-B',
            name: 'Step B (depends on A)',
            endpoint: 'GET /api/v1/contacts/{{contactId}}',
            dependsOn: ['step-A'],
            assertions: [],
          },
        ],
      };

      await service.execute('exec-001', group, 'mock-token');

      const updateCall = mockPrisma.platform.testGroupExecution.update.mock.calls.find(
        (call: any[]) => call[0].data?.stepResults,
      );
      expect(updateCall).toBeDefined();
      const stepResults = updateCall[0].data.stepResults;
      expect(stepResults[1].status).toBe('SKIPPED');
      expect(stepResults[1].errorMessage).toContain('dependency failed');
    });
  });
});
