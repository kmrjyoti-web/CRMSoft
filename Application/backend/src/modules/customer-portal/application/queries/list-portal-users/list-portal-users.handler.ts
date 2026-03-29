import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListPortalUsersQuery } from './list-portal-users.query';
import { ICustomerUserRepository, CUSTOMER_USER_REPOSITORY } from '../../../domain/interfaces/customer-user.repository.interface';

@QueryHandler(ListPortalUsersQuery)
export class ListPortalUsersHandler implements IQueryHandler<ListPortalUsersQuery> {
  constructor(
    @Inject(CUSTOMER_USER_REPOSITORY)
    private readonly userRepo: ICustomerUserRepository,
  ) {}

  async execute(query: ListPortalUsersQuery) {
    const { tenantId, page, limit, search, isActive } = query;
    return this.userRepo.findAllByTenant(tenantId, { page, limit, search, isActive });
  }
}
