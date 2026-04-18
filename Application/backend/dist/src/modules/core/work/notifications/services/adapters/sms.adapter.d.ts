import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { IChannelAdapter, ChannelSendParams, ChannelSendResult } from './channel-adapter.interface';
export declare class SmsAdapter implements IChannelAdapter {
    private readonly prisma;
    readonly channel = "SMS";
    private readonly logger;
    constructor(prisma: PrismaService);
    send(params: ChannelSendParams): Promise<ChannelSendResult>;
}
