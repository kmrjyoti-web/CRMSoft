import { PrismaService } from '../../../../core/prisma/prisma.service';
import { EmailProviderFactoryService } from './email-provider-factory.service';
import { ThreadBuilderService } from './thread-builder.service';
import { EmailLinkerService } from './email-linker.service';
export declare class EmailSyncService {
    private readonly prisma;
    private readonly providerFactory;
    private readonly threadBuilder;
    private readonly linker;
    constructor(prisma: PrismaService, providerFactory: EmailProviderFactoryService, threadBuilder: ThreadBuilderService, linker: EmailLinkerService);
    syncAccount(accountId: string): Promise<{
        newEmails: number;
        errors: number;
    }>;
    syncAllAccounts(): Promise<{
        synced: number;
        failed: number;
    }>;
}
