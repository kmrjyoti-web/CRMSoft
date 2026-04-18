import { PrismaService } from '../../../../core/prisma/prisma.service';
export interface IssueFlushParams {
    flushType: 'FULL' | 'ENTITY' | 'DEVICE';
    targetUserId?: string;
    targetDeviceId?: string;
    targetEntity?: string;
    reason: string;
    redownloadAfter?: boolean;
    issuedById: string;
    issuedByName: string;
}
export declare class FlushService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    issueFlush(params: IssueFlushParams): Promise<Record<string, unknown>>;
    acknowledgeFlush(flushId: string, deviceId: string): Promise<void>;
    executeFlush(flushId: string, deviceId: string): Promise<void>;
    cancelFlush(flushId: string): Promise<void>;
    getFlushCommands(filters: {
        targetUserId?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: Record<string, unknown>[];
        total: number;
    }>;
    private clearEntityFromState;
}
