import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
export declare class TestCoverageService {
    private readonly db;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService);
    getCoverageOverview(): Promise<object>;
    getModuleCoverage(moduleName: string): Promise<any>;
    refreshCoverage(): Promise<any[]>;
    private findSpecFiles;
}
