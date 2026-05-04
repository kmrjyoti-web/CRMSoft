import { Injectable, Logger, HttpException } from '@nestjs/common';
import { exec } from 'child_process';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { TEST_CENTER_ERRORS } from './test-center.errors';

@Injectable()
export class TestRunnerService {
  private readonly logger = new Logger(TestRunnerService.name);

  constructor(private readonly db: PlatformConsolePrismaService) {}

  async runTests(options: {
    moduleScope?: string;
    verticalScope?: string;
    planId?: string;
    triggerType?: string;
  }): Promise<any> {
    try {
      // Check no test is already running
      const running = await this.db.pcTestExecution.findFirst({
        where: { status: 'RUNNING' },
      });

      if (running) {
        const err = TEST_CENTER_ERRORS.TEST_ALREADY_RUNNING;
        throw new HttpException(
          { code: err.code, message: err.message, messageHi: err.messageHi },
          err.statusCode,
        );
      }

      // Create execution record
      const execution = await this.db.pcTestExecution.create({
        data: {
          planId: options.planId || null,
          triggerType: options.triggerType || 'MANUAL',
          moduleScope: options.moduleScope || null,
          verticalScope: options.verticalScope || null,
          status: 'RUNNING',
          startedAt: new Date(),
        },
      });

      // Build jest command
      let cmd = 'npx jest --no-coverage --json --silent';
      if (options.moduleScope) {
        cmd += ` --testPathPattern="modules/${options.moduleScope}"`;
      }
      if (options.verticalScope) {
        cmd += ` --testPathPattern="modules/vertical/${options.verticalScope}"`;
      }

      const cwd = process.cwd();
      this.logger.log(`Running tests: ${cmd} (cwd: ${cwd})`);

      // Fire and forget — execute in background
      exec(cmd, { cwd, maxBuffer: 50 * 1024 * 1024 }, async (error, stdout, stderr) => {
        try {
          let totalTests = 0;
          let passed = 0;
          let failed = 0;
          let skipped = 0;
          let duration: number | null = null;
          let status = 'PASSED';

          try {
            const result = JSON.parse(stdout);
            totalTests = result.numTotalTests || 0;
            passed = result.numPassedTests || 0;
            failed = result.numFailedTests || 0;
            skipped = result.numPendingTests || 0;
            duration = result.testResults
              ? result.testResults.reduce((sum: number, r: any) => sum + (r.endTime - r.startTime), 0)
              : null;
            status = failed > 0 ? 'FAILED' : 'PASSED';
          } catch {
            // If JSON parsing fails, mark as error
            if (error) {
              status = 'ERROR';
            }
          }

          const output = (stdout || stderr || (error ? error.message : '')).substring(0, 10000);

          await this.db.pcTestExecution.update({
            where: { id: execution.id },
            data: {
              totalTests,
              passed,
              failed,
              skipped,
              duration,
              status,
              output,
              completedAt: new Date(),
            },
          });

          this.logger.log(
            `Test execution ${execution.id} completed: ${status} (${passed}/${totalTests} passed)`,
          );
        } catch (updateError) {
          this.logger.error(
            `Failed to update execution ${execution.id}`,
            (updateError as Error).stack,
          );

          try {
            await this.db.pcTestExecution.update({
              where: { id: execution.id },
              data: {
                status: 'ERROR',
                output: (updateError as Error).message?.substring(0, 10000),
                completedAt: new Date(),
              },
            });
          } catch (finalError) {
            this.logger.error(
              `Failed to mark execution as error ${execution.id}`,
              (finalError as Error).stack,
            );
          }
        }
      });

      // Return immediately with RUNNING status
      return execution;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to run tests', (error as Error).stack);
      throw error;
    }
  }

  async runForModule(module: string): Promise<any> {
    try {
      return await this.runTests({ moduleScope: module, triggerType: 'MANUAL' });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to run tests for module ${module}`, (error as Error).stack);
      throw error;
    }
  }

  async runForVertical(code: string): Promise<any> {
    try {
      return await this.runTests({ verticalScope: code, triggerType: 'MANUAL' });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to run tests for vertical ${code}`, (error as Error).stack);
      throw error;
    }
  }
}
