import { ICommandHandler } from '@nestjs/cqrs';
import { ChangeCustomerPasswordCommand } from './change-customer-password.command';
import { ICustomerUserRepository } from '../../../domain/interfaces/customer-user.repository.interface';
export declare class ChangeCustomerPasswordHandler implements ICommandHandler<ChangeCustomerPasswordCommand> {
    private readonly userRepo;
    private readonly logger;
    constructor(userRepo: ICustomerUserRepository);
    execute(command: ChangeCustomerPasswordCommand): Promise<{
        message: string;
    }>;
}
