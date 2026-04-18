import { ICommandHandler } from '@nestjs/cqrs';
import { ActivatePortalCommand } from './activate-portal.command';
import { ICustomerUserRepository } from '../../../domain/interfaces/customer-user.repository.interface';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class ActivatePortalHandler implements ICommandHandler<ActivatePortalCommand> {
    private readonly userRepo;
    private readonly prisma;
    private readonly logger;
    constructor(userRepo: ICustomerUserRepository, prisma: PrismaService);
    execute(command: ActivatePortalCommand): Promise<{
        customerUserId: string;
        email: string;
        tempPassword: string;
        message: string;
    }>;
    private resolveEntity;
    private generateTempPassword;
}
