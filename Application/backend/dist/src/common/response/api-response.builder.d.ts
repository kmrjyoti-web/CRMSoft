import { PaginationMeta } from './api-response.interface';
export declare class ApiResponseBuilder {
    private _success;
    private _statusCode;
    private _message?;
    private _data?;
    private _meta?;
    private constructor();
    static success<T>(data: T): ApiResponseBuilder;
    static created<T>(data: T): ApiResponseBuilder;
    static noContent(): ApiResponseBuilder;
    static paginated<T>(items: T[], meta: PaginationMeta): ApiResponseBuilder;
    message(msg: string): this;
    statusCode(code: number): this;
    meta(meta: PaginationMeta): this;
    build(): {
        __isBuilderResult: true;
        success: boolean;
        statusCode: number;
        message?: string;
        data: any;
        meta?: PaginationMeta;
    };
}
