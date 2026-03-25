import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetPortalUserQuery } from './get-portal-user.query';
import { ICustomerUserRepository, CUSTOMER_USER_REPOSITORY } from '../../../domain/interfaces/customer-user.repository.interface';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(GetPortalUserQuery)
export class GetPortalUserHandler implements IQueryHandler<GetPortalUserQuery> {
  constructor(
    @Inject(CUSTOMER_USER_REPOSITORY)
    private readonly userRepo: ICustomerUserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(query: GetPortalUserQuery) {
    const user = await this.userRepo.findById(query.id);
    if (!user) throw new NotFoundException('Portal user not found');

    let menuCategory = null;
    if (user.menuCategoryId) {
      menuCategory = await this.prisma.identity.customerMenuCategory.findUnique({
        where: { id: user.menuCategoryId },
        select: { id: true, name: true, nameHi: true, icon: true, color: true, enabledRoutes: true },
      });
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName,
      companyName: user.companyName,
      linkedEntityType: user.linkedEntityType,
      linkedEntityId: user.linkedEntityId,
      linkedEntityName: user.linkedEntityName,
      isActive: user.isActive,
      isFirstLogin: user.isFirstLogin,
      loginCount: user.loginCount,
      lastLoginAt: user.lastLoginAt,
      pageOverrides: user.pageOverrides,
      menuCategory,
      createdAt: user.createdAt,
    };
  }
}
