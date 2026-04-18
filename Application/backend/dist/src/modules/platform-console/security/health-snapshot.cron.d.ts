import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { SecurityService } from './security.service';
export declare class HealthSnapshotCron {
    private readonly db;
    private readonly securityService;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService, securityService: SecurityService);
    captureSnapshots(): Promise<void>;
    cleanupOldSnapshots(): Promise<void>;
}
