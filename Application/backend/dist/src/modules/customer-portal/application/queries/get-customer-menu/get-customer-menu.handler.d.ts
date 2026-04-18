import { IQueryHandler } from '@nestjs/cqrs';
import { GetCustomerMenuQuery } from './get-customer-menu.query';
import { ICustomerUserRepository } from '../../../domain/interfaces/customer-user.repository.interface';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class GetCustomerMenuHandler implements IQueryHandler<GetCustomerMenuQuery> {
    private readonly userRepo;
    private readonly prisma;
    private readonly logger;
    constructor(userRepo: ICustomerUserRepository, prisma: PrismaService);
    execute(query: GetCustomerMenuQuery): Promise<{
        categoryName: string | undefined;
        totalRoutes: number;
        pageOverrides: Record<string, boolean>;
        menu: {
            route: string;
            name: string;
            nameHi: string;
            icon: string;
            group: string;
            isDefault?: boolean;
        }[];
        menuGrouped: Record<string, {
            route: string;
            name: string;
            nameHi: string;
            icon: string;
            group: string;
            isDefault?: boolean;
        }[]>;
    }>;
}
