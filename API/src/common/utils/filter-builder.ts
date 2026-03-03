/**
 * PrismaFilterBuilder — DRY utility for building Prisma `where` objects.
 *
 * Usage:
 *   const where = new PrismaFilterBuilder()
 *     .exact('status', query.status)
 *     .textContains('companyName', query.companyName)
 *     .dateRange('createdAt', query.createdAtFrom, query.createdAtTo)
 *     .numberRange('expectedValue', query.expectedValueMin, query.expectedValueMax)
 *     .search(query.search, ['firstName', 'lastName'])
 *     .build();
 */
export class PrismaFilterBuilder {
  private where: Record<string, any> = {};

  /** Exact match (enum, UUID, boolean) */
  exact(field: string, value?: unknown): this {
    if (value !== undefined && value !== null) {
      this.where[field] = value;
    }
    return this;
  }

  /** Case-insensitive text contains */
  textContains(field: string, value?: string): this {
    if (value) {
      this.where[field] = { contains: value, mode: 'insensitive' };
    }
    return this;
  }

  /** Date range (gte/lte) */
  dateRange(field: string, from?: string, to?: string): this {
    if (from || to) {
      this.where[field] = {};
      if (from) this.where[field].gte = new Date(from);
      if (to) this.where[field].lte = new Date(to);
    }
    return this;
  }

  /** Number range (gte/lte) */
  numberRange(field: string, min?: number, max?: number): this {
    if (min !== undefined || max !== undefined) {
      this.where[field] = {};
      if (min !== undefined) this.where[field].gte = min;
      if (max !== undefined) this.where[field].lte = max;
    }
    return this;
  }

  /** IN array filter */
  inArray(field: string, values?: string[]): this {
    if (values?.length) {
      this.where[field] = { in: values };
    }
    return this;
  }

  /** Entity filter tags (lookup value IDs) */
  entityFilters(filterValueIds?: string[]): this {
    if (filterValueIds?.length) {
      this.where.filters = {
        some: { lookupValueId: { in: filterValueIds } },
      };
    }
    return this;
  }

  /** Full-text search across multiple fields (OR logic) */
  search(
    term: string | undefined,
    fields: Array<string | Record<string, any>>,
  ): this {
    if (term) {
      this.where.OR = fields.map((field) => {
        if (typeof field === 'string') {
          return { [field]: { contains: term, mode: 'insensitive' } };
        }
        return field;
      });
    }
    return this;
  }

  /** Merge additional raw conditions */
  raw(conditions: Record<string, any>): this {
    Object.assign(this.where, conditions);
    return this;
  }

  build(): Record<string, any> {
    return this.where;
  }
}
