import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCustomerProfileQuery } from './get-customer-profile.query';
import { ICustomerUserRepository, CUSTOMER_USER_REPOSITORY } from '../../../domain/interfaces/customer-user.repository.interface';

@QueryHandler(GetCustomerProfileQuery)
export class GetCustomerProfileHandler implements IQueryHandler<GetCustomerProfileQuery> {
  constructor(
    @Inject(CUSTOMER_USER_REPOSITORY)
    private readonly userRepo: ICustomerUserRepository,
  ) {}

  async execute(query: GetCustomerProfileQuery) {
    const user = await this.userRepo.findById(query.customerId);
    if (!user) throw new NotFoundException('Customer account not found');

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      companyName: user.companyName,
      gstin: user.gstin,
      linkedEntityType: user.linkedEntityType,
      linkedEntityId: user.linkedEntityId,
      linkedEntityName: user.linkedEntityName,
      isFirstLogin: user.isFirstLogin,
      loginCount: user.loginCount,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
