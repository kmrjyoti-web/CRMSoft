import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { GetCustomerMenuQuery } from './get-customer-menu.query';
import { ICustomerUserRepository, CUSTOMER_USER_REPOSITORY } from '../../../domain/interfaces/customer-user.repository.interface';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { CUSTOMER_PORTAL_ROUTES } from '../../../data/portal-routes';

@QueryHandler(GetCustomerMenuQuery)
export class GetCustomerMenuHandler implements IQueryHandler<GetCustomerMenuQuery> {
    private readonly logger = new Logger(GetCustomerMenuHandler.name);

  constructor(
    @Inject(CUSTOMER_USER_REPOSITORY)
    private readonly userRepo: ICustomerUserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(query: GetCustomerMenuQuery) {
    try {
      const user = await this.userRepo.findById(query.customerId);
      if (!user) throw new NotFoundException('Customer account not found');

      let categoryRoutes: string[] = [];
      let categoryName: string | undefined;

      if (user.menuCategoryId) {
        const category = await this.prisma.identity.customerMenuCategory.findUnique({
          where: { id: user.menuCategoryId },
        });
        if (category) {
          categoryRoutes = category.enabledRoutes as string[];
          categoryName = category.name;
        }
      }

      const resolvedRoutes = user.resolveMenu(categoryRoutes);

      // Enrich with route metadata
      const routeMap = new Map(CUSTOMER_PORTAL_ROUTES.map((r) => [r.route, r]));
      const menuItems = resolvedRoutes.map((route) => ({
        ...(routeMap.get(route) ?? { route, name: route, nameHi: route, icon: 'circle', group: 'Other' }),
      }));

      // Group by section
      const grouped = menuItems.reduce(
        (acc, item) => {
          const group = item.group ?? 'Other';
          if (!acc[group]) acc[group] = [];
          acc[group].push(item);
          return acc;
        },
        {} as Record<string, typeof menuItems>,
      );

      return {
        categoryName,
        totalRoutes: resolvedRoutes.length,
        pageOverrides: user.pageOverrides,
        menu: menuItems,
        menuGrouped: grouped,
      };
    } catch (error) {
      this.logger.error(`GetCustomerMenuHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
