import { PrismaService } from '../../../../core/prisma/prisma.service';
import { EmailProviderFactoryService } from './email-provider-factory.service';
import { TrackingService } from './tracking.service';
export declare class EmailSenderService {
    private readonly prisma;
    private readonly providerFactory;
    private readonly trackingService;
    constructor(prisma: PrismaService, providerFactory: EmailProviderFactoryService, trackingService: TrackingService);
    send(emailId: string): Promise<void>;
    processScheduledEmails(): Promise<number>;
}
