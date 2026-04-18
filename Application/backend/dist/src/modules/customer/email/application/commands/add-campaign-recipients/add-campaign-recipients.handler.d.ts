import { ICommandHandler } from '@nestjs/cqrs';
import { AddCampaignRecipientsCommand } from './add-campaign-recipients.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class AddCampaignRecipientsHandler implements ICommandHandler<AddCampaignRecipientsCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: AddCampaignRecipientsCommand): Promise<{
        added: number;
        total: number;
    }>;
}
