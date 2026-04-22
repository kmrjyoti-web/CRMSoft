import { Paginated } from '../types/paginated.type';
import { Result } from '../result/result';

/**
 * IBaseRepository — generic port for all Prisma repository adapters.
 *
 * Rules:
 *  - Domain layer depends on this interface (port).
 *  - Infrastructure layer provides the Prisma implementation (adapter).
 *  - Use Symbol tokens for NestJS DI to avoid circular import issues.
 */
export interface IBaseRepository<TEntity, TQueryDto, TResponseDto> {
  save(entity: TEntity): Promise<Result<TEntity>>;
  findById(tenantId: string, id: string): Promise<TEntity | null>;
  findMany(tenantId: string, query: TQueryDto): Promise<Paginated<TResponseDto>>;
  update(entity: TEntity): Promise<Result<TEntity>>;
  softDelete(tenantId: string, id: string, deletedById: string): Promise<Result<void>>;
  exists(tenantId: string, id: string): Promise<boolean>;
}
