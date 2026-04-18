export declare class SearchEmailsQuery {
    readonly query: string;
    readonly page: number;
    readonly limit: number;
    readonly accountId?: string | undefined;
    constructor(query: string, page: number, limit: number, accountId?: string | undefined);
}
