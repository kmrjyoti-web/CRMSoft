import { ICommandHandler } from '@nestjs/cqrs';
import { DeactivatePortalCommand } from './deactivate-portal.command';
import { ICustomerUserRepository } from '../../../domain/interfaces/customer-user.repository.interface';
export declare class DeactivatePortalHandler implements ICommandHandler<DeactivatePortalCommand> {
    private readonly userRepo;
    private readonly logger;
    constructor(userRepo: ICustomerUserRepository);
    execute(command: DeactivatePortalCommand): Promise<{
        message: string;
    }>;
}
