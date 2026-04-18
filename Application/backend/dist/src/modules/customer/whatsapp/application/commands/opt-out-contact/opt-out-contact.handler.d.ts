import { ICommandHandler } from '@nestjs/cqrs';
import { OptOutContactCommand } from './opt-out-contact.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class OptOutContactHandler implements ICommandHandler<OptOutContactCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: OptOutContactCommand): Promise<{
        id: string;
        tenantId: string;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        contactId: string | null;
        reason: string | null;
        wabaId: string;
        phoneNumber: string;
        optedOutAt: Date;
    }>;
}
