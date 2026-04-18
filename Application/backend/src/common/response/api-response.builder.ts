import { PaginationMeta } from './api-response.interface';

/**
 * Fluent builder for consistent API responses.
 *
 * Usage:
 *   return ApiResponseBuilder.success(data).message('Lead created').statusCode(201).build();
 *   return ApiResponseBuilder.paginated(items, meta).message('Leads fetched').build();
 */
export class ApiResponseBuilder {
  private _success = true;
  private _statusCode = 200;
  private _message?: string;
  private _data?: any;
  private _meta?: PaginationMeta;

  private constructor() {}

  static success<T>(data: T): ApiResponseBuilder {
    const b = new ApiResponseBuilder();
    b._data = data;
    b._statusCode = 200;
    return b;
  }

  static created<T>(data: T): ApiResponseBuilder {
    const b = new ApiResponseBuilder();
    b._data = data;
    b._statusCode = 201;
    b._message = 'Created successfully';
    return b;
  }

  static noContent(): ApiResponseBuilder {
    const b = new ApiResponseBuilder();
    b._data = null;
    b._statusCode = 204;
    b._message = 'No content';
    return b;
  }

  static paginated<T>(items: T[], meta: PaginationMeta): ApiResponseBuilder {
    const b = new ApiResponseBuilder();
    b._data = items;
    b._meta = meta;
    b._statusCode = 200;
    return b;
  }

  message(msg: string): this {
    this._message = msg;
    return this;
  }

  statusCode(code: number): this {
    this._statusCode = code;
    return this;
  }

  meta(meta: PaginationMeta): this {
    this._meta = meta;
    return this;
  }

  build(): {
    __isBuilderResult: true;
    success: boolean;
    statusCode: number;
    message?: string;
    data: any;
    meta?: PaginationMeta;
  } {
    return {
      __isBuilderResult: true as const,
      success: this._success,
      statusCode: this._statusCode,
      message: this._message,
      data: this._data,
      meta: this._meta,
    };
  }
}
