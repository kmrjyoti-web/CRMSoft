import { ICommandHandler } from '@nestjs/cqrs';
import { CreateSignatureCommand } from './create-signature.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class CreateSignatureHandler implements ICommandHandler<CreateSignatureCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: CreateSignatureCommand): Promise<{
        id: string;
        tenantId: string;
        name: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        bodyHtml: string;
        userId: string;
    }>;
}
