import { PrismaService } from '../../core/prisma/prisma.service';
import { Paginated } from '../types/paginated.type';
export interface ListQueryParams {
    tenantId: string;
    page: number;
    limit: number;
    search?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    isDeleted?: boolean;
    where?: Record<string, unknown>;
    include?: Record<string, unknown>;
    select?: Record<string, unknown>;
}
export declare abstract class BaseListQueryHandler<TResponse> {
    protected readonly prisma: PrismaService;
    constructor(prisma: PrismaService);
    protected abstract get modelName(): string;
    protected buildWhere(params: ListQueryParams): Record<string, unknown>;
    protected buildSearchConditions(search: string): Record<string, unknown>[];
    protected executeList(params: ListQueryParams): Promise<Paginated<TResponse>>;
}
