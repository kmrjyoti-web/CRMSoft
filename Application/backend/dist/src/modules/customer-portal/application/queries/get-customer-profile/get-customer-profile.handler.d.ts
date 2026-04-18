import { IQueryHandler } from '@nestjs/cqrs';
import { GetCustomerProfileQuery } from './get-customer-profile.query';
import { ICustomerUserRepository } from '../../../domain/interfaces/customer-user.repository.interface';
export declare class GetCustomerProfileHandler implements IQueryHandler<GetCustomerProfileQuery> {
    private readonly userRepo;
    private readonly logger;
    constructor(userRepo: ICustomerUserRepository);
    execute(query: GetCustomerProfileQuery): Promise<{
        id: string;
        email: string;
        phone: string | undefined;
        displayName: string;
        avatarUrl: string | undefined;
        companyName: string | undefined;
        gstin: string | undefined;
        linkedEntityType: import("../../../domain/entities/customer-user.entity").LinkedEntityType;
        linkedEntityId: string;
        linkedEntityName: string;
        isFirstLogin: boolean;
        loginCount: number;
        lastLoginAt: Date | undefined;
    }>;
}
