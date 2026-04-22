import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CustomerUserEntity, CustomerUserProps, LinkedEntityType } from '../../domain/entities/customer-user.entity';
import { ICustomerUserRepository, ListPortalUsersOptions } from '../../domain/interfaces/customer-user.repository.interface';
import { Ok, Err, ResultType } from '@/common/types';
import { Paginated, paginate } from '@/common/types/paginated.type';

type CustomerUserRecord = {
  id: string;
  tenantId: string;
  email: string;
  phone: string | null;
  passwordHash: string;
  linkedEntityType: string;
  linkedEntityId: string;
  linkedEntityName: string;
  displayName: string;
  avatarUrl: string | null;
  companyName: string | null;
  gstin: string | null;
  menuCategoryId: string | null;
  pageOverrides: unknown;
  isActive: boolean;
  isFirstLogin: boolean;
  lastLoginAt: Date | null;
  loginCount: number;
  failedAttempts: number;
  lockedUntil: Date | null;
  refreshToken: string | null;
  refreshTokenExp: Date | null;
  passwordResetToken: string | null;
  passwordResetExp: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
};

@Injectable()
export class PrismaCustomerUserRepository implements ICustomerUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(record: CustomerUserRecord): CustomerUserEntity {
    const props: CustomerUserProps = {
      email: record.email,
      phone: record.phone ?? undefined,
      passwordHash: record.passwordHash,
      linkedEntityType: record.linkedEntityType as LinkedEntityType,
      linkedEntityId: record.linkedEntityId,
      linkedEntityName: record.linkedEntityName,
      displayName: record.displayName,
      avatarUrl: record.avatarUrl ?? undefined,
      companyName: record.companyName ?? undefined,
      gstin: record.gstin ?? undefined,
      menuCategoryId: record.menuCategoryId ?? undefined,
      pageOverrides: (record.pageOverrides as Record<string, boolean>) ?? {},
      isActive: record.isActive,
      isFirstLogin: record.isFirstLogin,
      lastLoginAt: record.lastLoginAt ?? undefined,
      loginCount: record.loginCount,
      failedAttempts: record.failedAttempts,
      lockedUntil: record.lockedUntil ?? undefined,
      refreshToken: record.refreshToken ?? undefined,
      refreshTokenExp: record.refreshTokenExp ?? undefined,
      passwordResetToken: record.passwordResetToken ?? undefined,
      passwordResetExp: record.passwordResetExp ?? undefined,
      isDeleted: record.isDeleted,
      createdById: record.createdById,
    };
    return CustomerUserEntity.fromPersistence(
      record.id,
      record.tenantId,
      props,
      record.createdAt,
      record.updatedAt,
    );
  }

  private toCreateData(entity: CustomerUserEntity) {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      email: entity.email,
      phone: entity.phone ?? null,
      passwordHash: entity.passwordHash,
      linkedEntityType: entity.linkedEntityType,
      linkedEntityId: entity.linkedEntityId,
      linkedEntityName: entity.linkedEntityName,
      displayName: entity.displayName,
      avatarUrl: entity.avatarUrl ?? null,
      companyName: entity.companyName ?? null,
      gstin: entity.gstin ?? null,
      menuCategoryId: entity.menuCategoryId ?? null,
      pageOverrides: entity.pageOverrides,
      isActive: entity.isActive,
      isFirstLogin: entity.isFirstLogin,
      loginCount: entity.loginCount,
      failedAttempts: entity.failedAttempts,
      lockedUntil: entity.lockedUntil ?? null,
      refreshToken: entity.refreshToken ?? null,
      refreshTokenExp: entity.refreshTokenExp ?? null,
      passwordResetToken: entity.passwordResetToken ?? null,
      passwordResetExp: entity.passwordResetExp ?? null,
      isDeleted: entity.isDeleted,
      createdById: entity.createdById,
    };
  }

  async save(entity: CustomerUserEntity): Promise<ResultType<CustomerUserEntity>> {
    try {
      const record = await this.prisma.identity.customerUser.create({
        data: this.toCreateData(entity),
      });
      return Ok(this.toEntity(record as CustomerUserRecord));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Unique constraint')) {
        return Err('CP_010', 'A portal user with this email or linked entity already exists', 409);
      }
      return Err('CP_011', `Failed to save customer user: ${msg}`, 500);
    }
  }

  async findById(id: string): Promise<CustomerUserEntity | null> {
    const record = await this.prisma.identity.customerUser.findFirst({
      where: { id, isDeleted: false },
    });
    return record ? this.toEntity(record as CustomerUserRecord) : null;
  }

  async findByEmail(tenantId: string, email: string): Promise<CustomerUserEntity | null> {
    const record = await this.prisma.identity.customerUser.findFirst({
      where: { tenantId, email, isDeleted: false },
    });
    return record ? this.toEntity(record as CustomerUserRecord) : null;
  }

  async findByLinkedEntity(
    tenantId: string,
    entityType: string,
    entityId: string,
  ): Promise<CustomerUserEntity | null> {
    const record = await this.prisma.identity.customerUser.findFirst({
      where: { tenantId, linkedEntityType: entityType, linkedEntityId: entityId, isDeleted: false },
    });
    return record ? this.toEntity(record as CustomerUserRecord) : null;
  }

  async findByRefreshToken(token: string): Promise<CustomerUserEntity | null> {
    const record = await this.prisma.identity.customerUser.findFirst({
      where: { refreshToken: token, isDeleted: false },
    });
    return record ? this.toEntity(record as CustomerUserRecord) : null;
  }

  async findByPasswordResetToken(token: string): Promise<CustomerUserEntity | null> {
    const record = await this.prisma.identity.customerUser.findFirst({
      where: { passwordResetToken: token, isDeleted: false },
    });
    return record ? this.toEntity(record as CustomerUserRecord) : null;
  }

  async findAllByTenant(
    tenantId: string,
    options: ListPortalUsersOptions,
  ): Promise<Paginated<CustomerUserEntity>> {
    const { page, limit, search, isActive } = options;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      isDeleted: false,
      ...(isActive !== undefined ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              { displayName: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { linkedEntityName: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [records, total] = await Promise.all([
      this.prisma.identity.customerUser.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.identity.customerUser.count({ where }),
    ]);

    return paginate(
      records.map((r) => this.toEntity(r as CustomerUserRecord)),
      total,
      page,
      limit,
    );
  }

  async update(entity: CustomerUserEntity): Promise<ResultType<CustomerUserEntity>> {
    try {
      const record = await this.prisma.identity.customerUser.update({
        where: { id: entity.id },
        data: {
          email: entity.email,
          phone: entity.phone ?? null,
          passwordHash: entity.passwordHash,
          displayName: entity.displayName,
          avatarUrl: entity.avatarUrl ?? null,
          companyName: entity.companyName ?? null,
          gstin: entity.gstin ?? null,
          menuCategoryId: entity.menuCategoryId ?? null,
          pageOverrides: entity.pageOverrides,
          isActive: entity.isActive,
          isFirstLogin: entity.isFirstLogin,
          lastLoginAt: entity.lastLoginAt ?? null,
          loginCount: entity.loginCount,
          failedAttempts: entity.failedAttempts,
          lockedUntil: entity.lockedUntil ?? null,
          refreshToken: entity.refreshToken ?? null,
          refreshTokenExp: entity.refreshTokenExp ?? null,
          passwordResetToken: entity.passwordResetToken ?? null,
          passwordResetExp: entity.passwordResetExp ?? null,
          isDeleted: entity.isDeleted,
        },
      });
      return Ok(this.toEntity(record as CustomerUserRecord));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return Err('CP_012', `Failed to update customer user: ${msg}`, 500);
    }
  }

  async softDelete(id: string): Promise<ResultType<void>> {
    try {
      await this.prisma.identity.customerUser.update({
        where: { id },
        data: { isDeleted: true, isActive: false },
      });
      return Ok(undefined);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return Err('CP_013', `Failed to delete customer user: ${msg}`, 500);
    }
  }
}
