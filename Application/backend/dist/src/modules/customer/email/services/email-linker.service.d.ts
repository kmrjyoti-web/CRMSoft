import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class EmailLinkerService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    autoLink(emailId: string, participantEmails: string[]): Promise<{
        entityType?: string;
        entityId?: string;
    }>;
    manualLink(emailId: string, entityType: string, entityId: string): Promise<void>;
    unlink(emailId: string): Promise<void>;
}
