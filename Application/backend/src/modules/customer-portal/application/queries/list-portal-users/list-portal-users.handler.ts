import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ListPortalUsersQuery } from './list-portal-users.query';
import { ICustomerUserRepository, CUSTOMER_USER_REPOSITORY } from '../../../domain/interfaces/customer-user.repository.interface';

@QueryHandler(ListPortalUsersQuery)
export class ListPortalUsersHandler implements IQueryHandler<ListPortalUsersQuery> {
    private readonly logger = new Logger(ListPortalUsersHandler.name);

  constructor(
    @Inject(CUSTOMER_USER_REPOSITORY)
    private readonly userRepo: ICustomerUserRepository,
  ) {}

  async execute(query: ListPortalUsersQuery) {
    try {
      const { tenantId, page, limit, search, isActive } = query;
      return this.userRepo.findAllByTenant(tenantId, { page, limit, search, isActive });
    } catch (error) {
      this.logger.error(`ListPortalUsersHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
