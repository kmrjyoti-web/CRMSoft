import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class ThreadBuilderService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    assignThread(emailId: string): Promise<string | null>;
    normalizeSubject(subject: string): string;
    private collectParticipants;
}
