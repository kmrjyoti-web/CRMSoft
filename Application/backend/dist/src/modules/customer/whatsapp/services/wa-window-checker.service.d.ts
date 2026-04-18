import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class WaWindowCheckerService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    isWindowOpen(windowExpiresAt: Date | null): boolean;
    getWindowExpiry(windowExpiresAt: Date | null): number;
    refreshWindow(conversationId: string): Promise<Date>;
    closeExpiredWindows(): Promise<number>;
}
