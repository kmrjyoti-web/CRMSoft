export declare class GetTemplatesQuery {
    readonly wabaId: string;
    readonly page: number;
    readonly limit: number;
    readonly status?: string | undefined;
    readonly category?: string | undefined;
    constructor(wabaId: string, page: number, limit: number, status?: string | undefined, category?: string | undefined);
}
