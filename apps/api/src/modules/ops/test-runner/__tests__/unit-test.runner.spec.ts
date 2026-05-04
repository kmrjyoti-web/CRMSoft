import { UnitTestRunner } from '../infrastructure/runners/unit-test.runner';
import { TestType } from '@prisma/platform-client';

const runner = new UnitTestRunner();

const JEST_OUTPUT = JSON.stringify({
  numTotalTests: 3,
  numPassedTests: 2,
  numFailedTests: 1,
  numPendingTests: 0,
  testResults: [
    {
      testFilePath: '/app/src/modules/customer/leads/__tests__/lead.entity.spec.ts',
      startTime: 1000,
      endTime: 1200,
      testResults: [
        { title: 'creates lead', fullName: 'LeadEntity creates lead', ancestorTitles: ['LeadEntity'], status: 'passed', duration: 100, failureMessages: [] },
        { title: 'validates email', fullName: 'LeadEntity validates email', ancestorTitles: ['LeadEntity'], status: 'passed', duration: 80, failureMessages: [] },
        { title: 'rejects invalid status', fullName: 'LeadEntity rejects invalid status', ancestorTitles: ['LeadEntity'], status: 'failed', duration: 20, failureMessages: ['Expected "INVALID" to be a valid status'], failureDetails: [{ stack: 'Error: Expected...\n  at Object.<anonymous>' }] },
      ],
    },
  ],
});

describe('UnitTestRunner', () => {
  it('type is UNIT', () => {
    expect(runner.type).toBe(TestType.UNIT);
  });

  describe('parseJestOutput', () => {
    it('returns correct totals', () => {
      const result = runner.parseJestOutput(JEST_OUTPUT, Date.now() - 200);
      expect(result.total).toBe(3);
      expect(result.passed).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.skipped).toBe(0);
      expect(result.type).toBe(TestType.UNIT);
    });

    it('maps passed/failed/pending statuses correctly', () => {
      const result = runner.parseJestOutput(JEST_OUTPUT, Date.now());
      const statuses = result.results.map(r => r.status);
      expect(statuses).toContain('PASS');
      expect(statuses).toContain('FAIL');
    });

    it('extracts module name from file path', () => {
      const result = runner.parseJestOutput(JEST_OUTPUT, Date.now());
      expect(result.results[0].module).toBe('leads');
    });

    it('extracts suite name from ancestorTitles', () => {
      const result = runner.parseJestOutput(JEST_OUTPUT, Date.now());
      expect(result.results[0].suiteName).toBe('LeadEntity');
    });

    it('includes errorMessage for failed tests', () => {
      const result = runner.parseJestOutput(JEST_OUTPUT, Date.now());
      const failed = result.results.find(r => r.status === 'FAIL');
      expect(failed?.errorMessage).toContain('Expected');
    });

    it('returns ERROR result when output has no JSON', () => {
      const result = runner.parseJestOutput('No JSON here', Date.now());
      expect(result.total).toBe(0);
      expect(result.errors).toBe(1);
    });

    it('handles jest output with leading non-JSON text', () => {
      const withPrefix = 'Some log output before JSON\n' + JEST_OUTPUT;
      const result = runner.parseJestOutput(withPrefix, Date.now());
      expect(result.total).toBe(3);
    });
  });
});
