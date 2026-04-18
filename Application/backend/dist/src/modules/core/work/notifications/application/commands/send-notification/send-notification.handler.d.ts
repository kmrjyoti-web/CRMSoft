import { ICommandHandler } from '@nestjs/cqrs';
import { SendNotificationCommand } from './send-notification.command';
import { ChannelRouterService } from '../../../services/channel-router.service';
export declare class SendNotificationHandler implements ICommandHandler<SendNotificationCommand> {
    private readonly channelRouter;
    private readonly logger;
    constructor(channelRouter: ChannelRouterService);
    execute(command: SendNotificationCommand): Promise<{
        channels: {
            channel: string;
            success: boolean;
        }[];
        template: string;
    }>;
}
