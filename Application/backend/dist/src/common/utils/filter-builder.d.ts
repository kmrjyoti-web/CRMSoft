export declare class PrismaFilterBuilder {
    private where;
    exact(field: string, value?: unknown): this;
    textContains(field: string, value?: string): this;
    dateRange(field: string, from?: string, to?: string): this;
    numberRange(field: string, min?: number, max?: number): this;
    inArray(field: string, values?: string[]): this;
    entityFilters(filterValueIds?: string[]): this;
    search(term: string | undefined, fields: Array<string | Record<string, any>>): this;
    raw(conditions: Record<string, any>): this;
    build(): Record<string, any>;
}
