import { CustomerUserEntity } from '../entities/customer-user.entity';
import { ResultType } from "../../../../common/types";
import { Paginated } from "../../../../common/types/paginated.type";
export declare const CUSTOMER_USER_REPOSITORY: unique symbol;
export interface ListPortalUsersOptions {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
}
export interface ICustomerUserRepository {
    save(entity: CustomerUserEntity): Promise<ResultType<CustomerUserEntity>>;
    findById(id: string): Promise<CustomerUserEntity | null>;
    findByEmail(tenantId: string, email: string): Promise<CustomerUserEntity | null>;
    findByLinkedEntity(tenantId: string, entityType: string, entityId: string): Promise<CustomerUserEntity | null>;
    findByRefreshToken(token: string): Promise<CustomerUserEntity | null>;
    findByPasswordResetToken(token: string): Promise<CustomerUserEntity | null>;
    findAllByTenant(tenantId: string, options: ListPortalUsersOptions): Promise<Paginated<CustomerUserEntity>>;
    update(entity: CustomerUserEntity): Promise<ResultType<CustomerUserEntity>>;
    softDelete(id: string): Promise<ResultType<void>>;
}
