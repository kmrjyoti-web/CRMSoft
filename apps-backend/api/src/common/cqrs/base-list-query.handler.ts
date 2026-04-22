import { PrismaService } from '../../core/prisma/prisma.service';
import { Paginated, paginate } from '../types/paginated.type';

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

/**
 * BaseListQueryHandler — eliminates the copy-paste list pattern across handlers.
 *
 * Usage:
 *   class GetLeadListHandler extends BaseListQueryHandler<LeadResponseDto> {
 *     protected get modelName() { return 'lead'; }
 *     protected buildSearchConditions(search: string) {
 *       return [
 *         { name: { contains: search, mode: 'insensitive' } },
 *         { email: { contains: search, mode: 'insensitive' } },
 *       ];
 *     }
 *   }
 */
export abstract class BaseListQueryHandler<TResponse> {
  constructor(protected readonly prisma: PrismaService) {}

  /** Return the Prisma model accessor name (e.g., 'lead', 'contact'). */
  protected abstract get modelName(): string;

  protected buildWhere(params: ListQueryParams): Record<string, unknown> {
    const where: any = {
      tenantId: params.tenantId,
      isDeleted: params.isDeleted ?? false,
      ...params.where,
    };

    if (params.search) {
      where['OR'] = this.buildSearchConditions(params.search);
    }

    return where;
  }

  /** Override to add module-specific search fields. */
  protected buildSearchConditions(search: string): Record<string, unknown>[] {
    return [
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  protected async executeList(params: ListQueryParams): Promise<Paginated<TResponse>> {
    const where = this.buildWhere(params);
    const skip = (params.page - 1) * params.limit;

    const model = (this.prisma as unknown as Record<string, any>)[this.modelName];

    if (!model) {
      throw new Error(`Prisma model "${this.modelName}" not found. Check the modelName getter.`);
    }

    const [data, total] = await Promise.all([
      model.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { [params.sortBy]: params.sortOrder },
        ...(params.include ? { include: params.include } : {}),
        ...(params.select ? { select: params.select } : {}),
      }),
      model.count({ where }),
    ]);

    return paginate<TResponse>(data as TResponse[], total, params.page, params.limit);
  }
}
