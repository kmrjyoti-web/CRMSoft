export declare class ListTargetsQuery {
    readonly page: number;
    readonly limit: number;
    readonly sortBy: string;
    readonly sortOrder: 'asc' | 'desc';
    readonly userId?: string | undefined;
    readonly period?: string | undefined;
    readonly metric?: string | undefined;
    readonly isActive?: boolean | undefined;
    constructor(page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc', userId?: string | undefined, period?: string | undefined, metric?: string | undefined, isActive?: boolean | undefined);
}
