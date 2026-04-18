import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { SetFieldValueCommand } from './set-field-value.command';
export declare class SetFieldValueHandler implements ICommandHandler<SetFieldValueCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: SetFieldValueCommand): Promise<{
        saved: any;
    }>;
}
