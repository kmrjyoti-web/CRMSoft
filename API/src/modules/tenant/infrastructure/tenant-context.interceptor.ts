import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextService } from './tenant-context.service';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // No user (public route) or super admin — skip ALS wrapping
    if (!user || user.isSuperAdmin) {
      return next.handle();
    }

    const tenantId = user.tenantId;
    if (!tenantId) {
      return next.handle();
    }

    // Wrap the request handler in ALS context
    return new Observable((subscriber) => {
      this.tenantContext.run({ tenantId }, () => {
        next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}
