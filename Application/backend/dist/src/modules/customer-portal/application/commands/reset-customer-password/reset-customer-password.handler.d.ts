import { ICommandHandler } from '@nestjs/cqrs';
import { ResetCustomerPasswordCommand } from './reset-customer-password.command';
import { ICustomerUserRepository } from '../../../domain/interfaces/customer-user.repository.interface';
export declare class ResetCustomerPasswordHandler implements ICommandHandler<ResetCustomerPasswordCommand> {
    private readonly userRepo;
    private readonly logger;
    constructor(userRepo: ICustomerUserRepository);
    execute(command: ResetCustomerPasswordCommand): Promise<{
        message: string;
    }>;
}
