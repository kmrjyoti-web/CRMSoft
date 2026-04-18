import { ICommandHandler } from '@nestjs/cqrs';
import { CreateSuperAdminCommand } from './create-super-admin.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class CreateSuperAdminHandler implements ICommandHandler<CreateSuperAdminCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: CreateSuperAdminCommand): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        lastLoginAt: Date | null;
    }>;
}
