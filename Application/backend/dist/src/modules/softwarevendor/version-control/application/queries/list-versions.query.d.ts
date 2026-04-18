export declare class ListVersionsQuery {
    readonly page: number;
    readonly limit: number;
    readonly status?: string | undefined;
    readonly releaseType?: string | undefined;
    constructor(page: number, limit: number, status?: string | undefined, releaseType?: string | undefined);
}
