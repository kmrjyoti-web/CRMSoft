"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TestCoverageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCoverageService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
const test_center_errors_1 = require("./test-center.errors");
let TestCoverageService = TestCoverageService_1 = class TestCoverageService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(TestCoverageService_1.name);
    }
    async getCoverageOverview() {
        try {
            const modules = await this.db.pcTestCoverage.findMany();
            const totalModules = modules.length;
            const coveredModules = modules.filter((m) => m.lineCoverage && m.lineCoverage > 0).length;
            const uncoveredModules = modules
                .filter((m) => !m.lineCoverage || m.lineCoverage === 0)
                .map((m) => m.moduleName);
            const coveredRecords = modules.filter((m) => m.lineCoverage != null);
            const avgLineCoverage = coveredRecords.length > 0
                ? Math.round((coveredRecords.reduce((sum, m) => sum + (m.lineCoverage || 0), 0) /
                    coveredRecords.length) *
                    100) / 100
                : 0;
            const branchRecords = modules.filter((m) => m.branchCoverage != null);
            const avgBranchCoverage = branchRecords.length > 0
                ? Math.round((branchRecords.reduce((sum, m) => sum + (m.branchCoverage || 0), 0) /
                    branchRecords.length) *
                    100) / 100
                : 0;
            return {
                totalModules,
                coveredModules,
                uncoveredModules,
                avgLineCoverage,
                avgBranchCoverage,
                modules,
            };
        }
        catch (error) {
            this.logger.error('Failed to get coverage overview', error.stack);
            throw error;
        }
    }
    async getModuleCoverage(moduleName) {
        try {
            const coverage = await this.db.pcTestCoverage.findFirst({
                where: { moduleName },
            });
            if (!coverage) {
                const err = test_center_errors_1.TEST_CENTER_ERRORS.INVALID_MODULE;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
            }
            return coverage;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`Failed to get coverage for module ${moduleName}`, error.stack);
            throw error;
        }
    }
    async refreshCoverage() {
        try {
            const modulesDir = path.join(process.cwd(), 'src', 'modules');
            let moduleDirs = [];
            try {
                moduleDirs = fs.readdirSync(modulesDir).filter((entry) => {
                    const fullPath = path.join(modulesDir, entry);
                    return fs.statSync(fullPath).isDirectory();
                });
            }
            catch (readError) {
                this.logger.error('Failed to read modules directory', readError.stack);
                const err = test_center_errors_1.TEST_CENTER_ERRORS.COVERAGE_FAILED;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
            }
            const results = [];
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
                        }
                        catch {
                        }
                    }
                    const record = await this.db.pcTestCoverage.upsert({
                        where: {
                            moduleName_verticalType: {
                                moduleName,
                                verticalType: null,
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
                }
                catch (moduleError) {
                    this.logger.error(`Failed to refresh coverage for module ${moduleName}`, moduleError.stack);
                }
            }
            this.logger.log(`Coverage refreshed for ${results.length} modules`);
            return results;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error('Failed to refresh coverage', error.stack);
            throw error;
        }
    }
    findSpecFiles(dir) {
        const specFiles = [];
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    specFiles.push(...this.findSpecFiles(fullPath));
                }
                else if (entry.name.endsWith('.spec.ts')) {
                    specFiles.push(fullPath);
                }
            }
        }
        catch {
        }
        return specFiles;
    }
};
exports.TestCoverageService = TestCoverageService;
exports.TestCoverageService = TestCoverageService = TestCoverageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService])
], TestCoverageService);
//# sourceMappingURL=test-coverage.service.js.map