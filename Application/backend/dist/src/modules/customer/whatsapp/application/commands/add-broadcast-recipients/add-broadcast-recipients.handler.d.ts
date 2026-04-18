import { ICommandHandler } from '@nestjs/cqrs';
import { AddBroadcastRecipientsCommand } from './add-broadcast-recipients.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class AddBroadcastRecipientsHandler implements ICommandHandler<AddBroadcastRecipientsCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: AddBroadcastRecipientsCommand): Promise<void>;
}
