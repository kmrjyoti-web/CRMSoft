import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';

export interface StepResult {
  stepId: string;
  stepName: string;
  status: 'PASS' | 'FAIL' | 'ERROR' | 'SKIPPED';
  duration: number;
  requestSent?: { method: string; url: string; body?: any };
  responseReceived?: { status: number; body: any; duration: number };
  assertions?: AssertionResult[];
  savedValues?: Record<string, any>;
  errorMessage?: string | null;
}

export interface AssertionResult {
  field: string;
  operator: string;
  expected: any;
  actual: any;
  passed: boolean;
}

@Injectable()
export class TestGroupRunnerService {
  private readonly logger = new Logger(TestGroupRunnerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(executionId: string, group: any, authToken: string): Promise<void> {
    const steps: any[] = group.steps ?? [];
    const savedValues: Record<string, any> = {};
    const stepResults: StepResult[] = [];
    const skippedStepIds = new Set<string>();
    let passed = 0, failed = 0, errors = 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Skip if a dependency failed
      if (step.dependsOn?.some((depId: string) => skippedStepIds.has(depId))) {
        const skipped: StepResult = {
          stepId: step.id,
          stepName: step.name,
          status: 'SKIPPED',
          duration: 0,
          errorMessage: `Skipped: dependency failed`,
        };
        stepResults.push(skipped);
        skippedStepIds.add(step.id);
        continue;
      }

      // Update progress
      await this.prisma.platform.testGroupExecution.update({
        where: { id: executionId },
        data: { currentStep: i + 1 },
      });

      const stepResult = await this.executeStep(step, savedValues, authToken);
      stepResults.push(stepResult);

      if (stepResult.status === 'PASS') {
        passed++;
        if (stepResult.savedValues) Object.assign(savedValues, stepResult.savedValues);
      } else if (stepResult.status === 'FAIL') {
        failed++;
        skippedStepIds.add(step.id);
      } else if (stepResult.status === 'ERROR') {
        errors++;
        skippedStepIds.add(step.id);
      }
    }

    const finalStatus = failed > 0 || errors > 0 ? 'FAILED' : 'COMPLETED';
    const totalDuration = stepResults.reduce((sum, r) => sum + (r.duration ?? 0), 0);

    await this.prisma.platform.testGroupExecution.update({
      where: { id: executionId },
      data: {
        status: finalStatus,
        stepResults: stepResults as any,
        totalPassed: passed,
        totalFailed: failed,
        totalErrors: errors,
        duration: totalDuration,
        completedAt: new Date(),
      },
    });

    await this.prisma.platform.testGroup.update({
      where: { id: group.id },
      data: {
        runCount: { increment: 1 },
        lastRunAt: new Date(),
        lastRunStatus: finalStatus === 'COMPLETED' ? 'PASS' : 'FAIL',
      },
    });

    this.logger.log(`TestGroup ${group.name} (${executionId}): ${finalStatus} — ${passed}/${steps.length} passed`);
  }

  async executeStep(
    step: any,
    savedValues: Record<string, any>,
    authToken: string,
  ): Promise<StepResult> {
    const startTime = Date.now();
    const baseUrl = `http://localhost:${process.env.PORT ?? 3000}`;

    try {
      const resolvedBody = this.resolveTemplateVars(step.requestBody, savedValues);
      const resolvedEndpoint = this.resolveTemplateVars(step.endpoint, savedValues);

      const [method, ...pathParts] = (resolvedEndpoint as string).split(' ');
      const path = pathParts.join(' ');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30_000);

      const response = await fetch(`${baseUrl}${path}`, {
        method: method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: resolvedBody && method !== 'GET' && method !== 'DELETE'
          ? JSON.stringify(resolvedBody)
          : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseBody = await response.json().catch(() => null);
      const duration = Date.now() - startTime;

      const assertionResults: AssertionResult[] = (step.assertions ?? []).map((assertion: any) => {
        const actual = assertion.field === 'status'
          ? response.status
          : this.getNestedValue(responseBody, assertion.field.replace(/^body\./, ''));
        const passed = this.evaluateAssertion(actual, assertion.operator, assertion.expected);
        return { field: assertion.field, operator: assertion.operator, expected: assertion.expected, actual, passed };
      });

      const allPassed = assertionResults.every(a => a.passed);

      // Extract values to carry forward
      const savedFromStep: Record<string, any> = {};
      if (step.saveAs && responseBody) {
        for (const [key, pathExpr] of Object.entries(step.saveAs as Record<string, string>)) {
          savedFromStep[key] = this.getNestedValue(responseBody, pathExpr.replace(/^body\./, ''));
        }
      }

      const failedAssertions = assertionResults.filter(a => !a.passed);

      return {
        stepId: step.id,
        stepName: step.name,
        status: allPassed ? 'PASS' : 'FAIL',
        duration,
        requestSent: { method, url: path, body: resolvedBody },
        responseReceived: { status: response.status, body: responseBody, duration },
        assertions: assertionResults,
        savedValues: savedFromStep,
        errorMessage: allPassed
          ? null
          : `${failedAssertions.length} assertion(s) failed: ${failedAssertions.map(a => `${a.field} ${a.operator} ${JSON.stringify(a.expected)} (got ${JSON.stringify(a.actual)})`).join(', ')}`,
      };
    } catch (error: any) {
      return {
        stepId: step.id,
        stepName: step.name,
        status: 'ERROR',
        duration: Date.now() - startTime,
        errorMessage: error.message?.substring(0, 1000),
      };
    }
  }

  resolveTemplateVars(obj: any, values: Record<string, any>): any {
    if (obj === null || obj === undefined) return obj;
    const str = JSON.stringify(obj);
    const resolved = str.replace(/\{\{(\w+)\}\}/g, (_, key) =>
      key in values ? String(values[key]) : `{{${key}}}`,
    );
    try {
      return JSON.parse(resolved);
    } catch {
      return resolved;
    }
  }

  private getNestedValue(obj: any, path?: string): any {
    if (!path || obj === null || obj === undefined) return obj;
    return path.split('.').reduce((curr, key) => curr?.[key], obj);
  }

  evaluateAssertion(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'eq':         return actual === expected;
      case 'neq':        return actual !== expected;
      case 'gt':         return actual > expected;
      case 'gte':        return actual >= expected;
      case 'lt':         return actual < expected;
      case 'lte':        return actual <= expected;
      case 'exists':     return actual !== null && actual !== undefined;
      case 'not_exists': return actual === null || actual === undefined;
      case 'contains':   return String(actual).includes(String(expected));
      case 'matches':    return new RegExp(String(expected)).test(String(actual));
      case 'in':         return Array.isArray(expected) && expected.includes(actual);
      case 'type':       return typeof actual === expected;
      default:           return false;
    }
  }
}
