export declare class GetTemplatesQuery {
    readonly page: number;
    readonly limit: number;
    readonly category?: string | undefined;
    readonly isShared?: boolean | undefined;
    readonly search?: string | undefined;
    constructor(page: number, limit: number, category?: string | undefined, isShared?: boolean | undefined, search?: string | undefined);
}
