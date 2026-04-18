import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { IChannelAdapter, ChannelSendParams, ChannelSendResult } from './channel-adapter.interface';
export declare class WhatsAppAdapter implements IChannelAdapter {
    private readonly prisma;
    readonly channel = "WHATSAPP";
    private readonly logger;
    constructor(prisma: PrismaService);
    send(params: ChannelSendParams): Promise<ChannelSendResult>;
}
