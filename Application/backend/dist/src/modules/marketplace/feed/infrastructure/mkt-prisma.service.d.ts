import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient as MarketplaceClient } from '@prisma/marketplace-client';
export declare class MktPrismaService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private _client;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    get client(): MarketplaceClient;
}
