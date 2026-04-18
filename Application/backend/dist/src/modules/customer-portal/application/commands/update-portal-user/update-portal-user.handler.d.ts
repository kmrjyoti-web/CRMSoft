import { ICommandHandler } from '@nestjs/cqrs';
import { UpdatePortalUserCommand } from './update-portal-user.command';
import { ICustomerUserRepository } from '../../../domain/interfaces/customer-user.repository.interface';
export declare class UpdatePortalUserHandler implements ICommandHandler<UpdatePortalUserCommand> {
    private readonly userRepo;
    private readonly logger;
    constructor(userRepo: ICustomerUserRepository);
    execute(command: UpdatePortalUserCommand): Promise<{
        id: string;
        message: string;
    }>;
}
