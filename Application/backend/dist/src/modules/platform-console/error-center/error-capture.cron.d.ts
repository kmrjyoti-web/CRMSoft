import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { EscalationService } from './escalation.service';
export declare class ErrorCaptureCron {
    private readonly db;
    private readonly escalationService;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService, escalationService: EscalationService);
    checkThresholds(): Promise<void>;
    dailyTrend(): Promise<void>;
    weeklyTrend(): Promise<void>;
}
