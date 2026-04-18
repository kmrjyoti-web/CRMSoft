import { IQueryHandler } from '@nestjs/cqrs';
import { ListPortalUsersQuery } from './list-portal-users.query';
import { ICustomerUserRepository } from '../../../domain/interfaces/customer-user.repository.interface';
export declare class ListPortalUsersHandler implements IQueryHandler<ListPortalUsersQuery> {
    private readonly userRepo;
    private readonly logger;
    constructor(userRepo: ICustomerUserRepository);
    execute(query: ListPortalUsersQuery): Promise<import("../../../../../common/types").PaginatedResult<import("../../..").CustomerUserEntity>>;
}
