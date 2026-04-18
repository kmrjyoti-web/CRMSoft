import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { VerticalManagerService } from './vertical-manager.service';
export declare class VerticalHealthCron {
    private readonly db;
    private readonly verticalManagerService;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService, verticalManagerService: VerticalManagerService);
    handleHealthCheck(): Promise<void>;
    handleWeeklyAudit(): Promise<void>;
}
