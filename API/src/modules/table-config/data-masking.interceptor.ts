import {
  Injectable,
  Logger,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DataMaskingService } from './services/data-masking.service';

export const MASK_TABLE_KEY = 'mask_table_key';

/**
 * Decorator to mark a controller method for data masking.
 * Usage: @MaskTable('contacts')
 */
export const MaskTable = (tableKey: string) =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(MASK_TABLE_KEY, tableKey, descriptor.value);
    return descriptor;
  };

/**
 * NestJS interceptor that applies data masking to list endpoint responses.
 *
 * Apply on entity controllers:
 * @UseInterceptors(DataMaskingInterceptor)
 * @MaskTable('contacts')
 * @Get()
 * async findAll() { ... }
 */
@Injectable()
export class DataMaskingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DataMaskingInterceptor.name);

  constructor(
    private readonly maskingService: DataMaskingService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const tableKey = Reflect.getMetadata(
      MASK_TABLE_KEY,
      context.getHandler(),
    );

    if (!tableKey) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id || !user?.tenantId) {
      return next.handle();
    }

    return next.handle().pipe(
      switchMap((response) =>
        from(
          (async () => {
            try {
              const rules = await this.maskingService.getMaskingRules(
                tableKey,
                user.id,
                user.roleId,
                user.tenantId,
              );

              if (rules.length === 0) return response;

              // Handle paginated response { success, data: [...], meta: {...} }
              if (response?.data && Array.isArray(response.data)) {
                return {
                  ...response,
                  data: this.maskingService.applyMasking(response.data, rules),
                };
              }

              // Handle nested response { data: { data: [...], meta: {...} } }
              if (response?.data?.data && Array.isArray(response.data.data)) {
                return {
                  ...response,
                  data: {
                    ...response.data,
                    data: this.maskingService.applyMasking(
                      response.data.data,
                      rules,
                    ),
                  },
                };
              }

              // Handle array response
              if (Array.isArray(response)) {
                return this.maskingService.applyMasking(response, rules);
              }

              return response;
            } catch (err) {
              // Never let masking errors break list endpoints
              this.logger.warn(
                `Data masking failed for ${tableKey}: ${err.message}`,
              );
              return response;
            }
          })(),
        ),
      ),
    );
  }
}
