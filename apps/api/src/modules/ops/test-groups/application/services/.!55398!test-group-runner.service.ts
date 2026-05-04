import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';

export interface StepResult {
  stepId: string;
  stepName: string;
  status: 'PASS' | 'FAIL' | 'ERROR' | 'SKIPPED';
  duration: number;
  requestSent?: { method: string; url: string; body?: any };
  responseReceived?: { status: number; body: Record<string, unknown>; duration: number };
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

