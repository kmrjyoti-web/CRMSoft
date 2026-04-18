import { ICommandHandler } from '@nestjs/cqrs';
import { ForgotCustomerPasswordCommand } from './forgot-customer-password.command';
import { ICustomerUserRepository } from '../../../domain/interfaces/customer-user.repository.interface';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class ForgotCustomerPasswordHandler implements ICommandHandler<ForgotCustomerPasswordCommand> {
    private readonly userRepo;
    private readonly prisma;
    private readonly logger;
    constructor(userRepo: ICustomerUserRepository, prisma: PrismaService);
    execute(command: ForgotCustomerPasswordCommand): Promise<{
        message: string;
    }>;
}
