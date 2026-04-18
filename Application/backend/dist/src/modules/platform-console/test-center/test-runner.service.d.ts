import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
export declare class TestRunnerService {
    private readonly db;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService);
    runTests(options: {
        moduleScope?: string;
        verticalScope?: string;
        planId?: string;
        triggerType?: string;
    }): Promise<any>;
    runForModule(module: string): Promise<any>;
    runForVertical(code: string): Promise<any>;
}
