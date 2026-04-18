import { PrismaService } from '../../../../core/prisma/prisma.service';
import { TemplateRendererService } from './template-renderer.service';
import { TrackingService } from './tracking.service';
import { EmailSenderService } from './email-sender.service';
export declare class CampaignExecutorService {
    private readonly prisma;
    private readonly templateRenderer;
    private readonly trackingService;
    private readonly emailSender;
    constructor(prisma: PrismaService, templateRenderer: TemplateRendererService, trackingService: TrackingService, emailSender: EmailSenderService);
    executeCampaign(campaignId: string): Promise<void>;
    pauseCampaign(campaignId: string): Promise<void>;
    cancelCampaign(campaignId: string): Promise<void>;
}
