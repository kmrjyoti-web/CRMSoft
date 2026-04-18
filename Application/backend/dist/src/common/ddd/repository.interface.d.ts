import { Paginated } from '../types/paginated.type';
import { Result } from '../result/result';
export interface IBaseRepository<TEntity, TQueryDto, TResponseDto> {
    save(entity: TEntity): Promise<Result<TEntity>>;
    findById(tenantId: string, id: string): Promise<TEntity | null>;
    findMany(tenantId: string, query: TQueryDto): Promise<Paginated<TResponseDto>>;
    update(entity: TEntity): Promise<Result<TEntity>>;
    softDelete(tenantId: string, id: string, deletedById: string): Promise<Result<void>>;
    exists(tenantId: string, id: string): Promise<boolean>;
}
