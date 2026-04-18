import { PrismaService } from '../../../../core/prisma/prisma.service';
import { WaApiService } from './wa-api.service';
export declare class WaBroadcastExecutorService {
    private readonly prisma;
    private readonly waApiService;
    private readonly logger;
    constructor(prisma: PrismaService, waApiService: WaApiService);
    executeBroadcast(broadcastId: string): Promise<void>;
    pauseBroadcast(broadcastId: string): Promise<void>;
    cancelBroadcast(broadcastId: string): Promise<void>;
    private buildComponents;
    private getOrCreateConversationId;
}
