import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
/**
 * Base PrismaService for @crmsoft/* SDK consumers.
 *
 * For multi-schema architectures (identity + platform + working DBs),
 * extend this class or instantiate separate PrismaClient instances per DB.
 *
 * The full multi-schema PrismaService lives in Application/backend/src/core/prisma/
 * and uses generated @prisma/identity-client, @prisma/platform-client etc.
 */
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    constructor(databaseUrl?: string);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
//# sourceMappingURL=prisma.service.d.ts.map