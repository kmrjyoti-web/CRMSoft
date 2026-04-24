import { Injectable, Logger, HttpException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { TEST_CENTER_ERRORS } from './test-center.errors';

@Injectable()
export class TestCoverageService {
  private readonly logger = new Logger(TestCoverageService.name);

  constructor(private readonly db: PlatformConsolePrismaService) {}

  async getCoverageOverview(): Promise<object> {
    try {
      const modules = await this.db.pcTestCoverage.findMany();

      const totalModules = modules.length;
      const coveredModules = modules.filter((m) => m.lineCoverage && m.lineCoverage > 0).length;
      const uncoveredModules = modules
        .filter((m) => !m.lineCoverage || m.lineCoverage === 0)
        .map((m) => m.moduleName);

      const coveredRecords = modules.filter((m) => m.lineCoverage != null);
      const avgLineCoverage =
        coveredRecords.length > 0
          ? Math.round(
              (coveredRecords.reduce((sum, m) => sum + (m.lineCoverage || 0), 0) /
                coveredRecords.length) *
                100,
            ) / 100
          : 0;

      const branchRecords = modules.filter((m) => m.branchCoverage != null);
      const avgBranchCoverage =
        branchRecords.length > 0
          ? Math.round(
              (branchRecords.reduce((sum, m) => sum + (m.branchCoverage || 0), 0) /
                branchRecords.length) *
                100,
            ) / 100
          : 0;

      return {
        totalModules,
        coveredModules,
        uncoveredModules,
        avgLineCoverage,
        avgBranchCoverage,
        modules,
      };
    } catch (error) {
      this.logger.error('Failed to get coverage overview', (error as Error).stack);
      throw error;
    }
  }

  async getModuleCoverage(moduleName: string): Promise<any> {
    try {
      const coverage = await this.db.pcTestCoverage.findFirst({
        where: { moduleName },
      });

      if (!coverage) {
        const err = TEST_CENTER_ERRORS.INVALID_MODULE;
        throw new HttpException(
          { code: err.code, message: err.message, messageHi: err.messageHi },
          err.statusCode,
        );
      }

      return coverage;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get coverage for module ${moduleName}`, (error as Error).stack);
      throw error;
    }
  }

  async refreshCoverage(): Promise<any[]> {
    try {
      const modulesDir = path.join(process.cwd(), 'src', 'modules');
      let moduleDirs: string[] = [];

      try {
        moduleDirs = fs.readdirSync(modulesDir).filter((entry) => {
          const fullPath = path.join(modulesDir, entry);
          return fs.statSync(fullPath).isDirectory();
        });
      } catch (readError) {
        this.logger.error('Failed to read modules directory', (readError as Error).stack);
        const err = TEST_CENTER_ERRORS.COVERAGE_FAILED;
        throw new HttpException(
          { code: err.code, message: err.message, messageHi: err.messageHi },
          err.statusCode,
        );
      }

      const results: any[] = [];

      for (const moduleName of moduleDirs) {
        try {
          const moduleDir = path.join(modulesDir, moduleName);
          const specFiles = this.findSpecFiles(moduleDir);
          const specFileCount = specFiles.length;

          let totalTests = 0;
          for (const specFile of specFiles) {
            try {
              const content = fs.readFileSync(specFile, 'utf-8');
              const matches = content.match(/it\(/g);
              totalTests += matches ? matches.length : 0;
            } catch {
              // Skip unreadable files
            }
          }

          const record = await this.db.pcTestCoverage.upsert({
            where: {
              moduleName_verticalType: {
                moduleName,
                verticalType: null as any,
              },
            },
            create: {
              moduleName,
              specFileCount,
              totalTests,
              lineCoverage: null,
              branchCoverage: null,
              lastUpdated: new Date(),
            },
            update: {
              specFileCount,
              totalTests,
              lineCoverage: null,
              branchCoverage: null,
              lastUpdated: new Date(),
            },
          });

          results.push(record);
        } catch (moduleError) {
          this.logger.error(
            `Failed to refresh coverage for module ${moduleName}`,
            (moduleError as Error).stack,
          );
        }
      }

      this.logger.log(`Coverage refreshed for ${results.length} modules`);
      return results;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to refresh coverage', (error as Error).stack);
      throw error;
    }
  }

  private findSpecFiles(dir: string): string[] {
    const specFiles: string[] = [];

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          specFiles.push(...this.findSpecFiles(fullPath));
        } else if (entry.name.endsWith('.spec.ts')) {
          specFiles.push(fullPath);
        }
      }
    } catch {
      // Skip unreadable directories
    }

    return specFiles;
  }
}
