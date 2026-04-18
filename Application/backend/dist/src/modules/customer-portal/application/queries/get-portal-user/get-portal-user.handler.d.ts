import { IQueryHandler } from '@nestjs/cqrs';
import { GetPortalUserQuery } from './get-portal-user.query';
import { ICustomerUserRepository } from '../../../domain/interfaces/customer-user.repository.interface';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class GetPortalUserHandler implements IQueryHandler<GetPortalUserQuery> {
    private readonly userRepo;
    private readonly prisma;
    private readonly logger;
    constructor(userRepo: ICustomerUserRepository, prisma: PrismaService);
    execute(query: GetPortalUserQuery): Promise<{
        id: string;
        email: string;
        phone: string | undefined;
        displayName: string;
        companyName: string | undefined;
        linkedEntityType: import("../../../domain/entities/customer-user.entity").LinkedEntityType;
        linkedEntityId: string;
        linkedEntityName: string;
        isActive: boolean;
        isFirstLogin: boolean;
        loginCount: number;
        lastLoginAt: Date | undefined;
        pageOverrides: Record<string, boolean>;
        menuCategory: {
            id: string;
            name: string;
            color: string | null;
            icon: string | null;
            nameHi: string | null;
            enabledRoutes: import("@prisma/identity-client/runtime/library").JsonValue;
        } | null;
        createdAt: Date;
    }>;
}
