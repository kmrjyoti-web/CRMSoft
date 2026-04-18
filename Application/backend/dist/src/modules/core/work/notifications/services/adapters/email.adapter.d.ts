import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { IChannelAdapter, ChannelSendParams, ChannelSendResult } from './channel-adapter.interface';
export declare class EmailAdapter implements IChannelAdapter {
    private readonly prisma;
    readonly channel = "EMAIL";
    private readonly logger;
    constructor(prisma: PrismaService);
    send(params: ChannelSendParams): Promise<ChannelSendResult>;
}
