export class ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;

  constructor() {
    Object.defineProperty(this, '__isApiResponse', { value: true, enumerable: false });
  }

  static success<T>(data: T, message = 'Success', meta?: Record<string, unknown>): ApiResponse<T> {
    const r = new ApiResponse<T>();
    r.success = true;
    r.message = message;
    r.data = data;
    if (meta) r.meta = meta;
    return r;
  }

  static error(message: string): ApiResponse<null> {
    const r = new ApiResponse<null>();
    r.success = false;
    r.message = message;
    return r;
  }

  static paginated<T>(data: T[], total: number, page: number, limit: number): ApiResponse<T[]> {
    const totalPages = Math.ceil(total / limit);
    return ApiResponse.success(data, 'Success', {
      total, page, limit, totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    });
  }
}

