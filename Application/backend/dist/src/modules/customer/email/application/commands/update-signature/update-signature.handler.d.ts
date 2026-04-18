import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateSignatureCommand } from './update-signature.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class UpdateSignatureHandler implements ICommandHandler<UpdateSignatureCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: UpdateSignatureCommand): Promise<{
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
