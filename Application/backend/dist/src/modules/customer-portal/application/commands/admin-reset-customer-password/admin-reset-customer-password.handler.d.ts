import { ICommandHandler } from '@nestjs/cqrs';
import { AdminResetCustomerPasswordCommand } from './admin-reset-customer-password.command';
import { ICustomerUserRepository } from '../../../domain/interfaces/customer-user.repository.interface';
export declare class AdminResetCustomerPasswordHandler implements ICommandHandler<AdminResetCustomerPasswordCommand> {
    private readonly userRepo;
    private readonly logger;
    constructor(userRepo: ICustomerUserRepository);
    execute(command: AdminResetCustomerPasswordCommand): Promise<{
        email: string;
        newPassword: string;
        message: string;
    }>;
    private generatePassword;
}
