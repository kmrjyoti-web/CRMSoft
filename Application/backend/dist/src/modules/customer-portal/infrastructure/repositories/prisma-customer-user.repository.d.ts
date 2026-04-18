import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CustomerUserEntity } from '../../domain/entities/customer-user.entity';
import { ICustomerUserRepository, ListPortalUsersOptions } from '../../domain/interfaces/customer-user.repository.interface';
import { ResultType } from "../../../../common/types";
import { Paginated } from "../../../../common/types/paginated.type";
export declare class PrismaCustomerUserRepository implements ICustomerUserRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private toEntity;
    private toCreateData;
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
