import { ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { BulkSeedMenusCommand } from './bulk-seed-menus.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class BulkSeedMenusHandler implements ICommandHandler<BulkSeedMenusCommand> {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService);
    execute(cmd: BulkSeedMenusCommand): Promise<{
        seeded: number;
    }>;
    private createMenu;
}
