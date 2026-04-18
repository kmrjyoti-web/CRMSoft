import { ICommandHandler } from '@nestjs/cqrs';
import { OptInContactCommand } from './opt-in-contact.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class OptInContactHandler implements ICommandHandler<OptInContactCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: OptInContactCommand): Promise<import("@prisma/working-client").Prisma.BatchPayload>;
}
