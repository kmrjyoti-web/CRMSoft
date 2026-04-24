import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantStore {
  tenantId: string;
  isSuperAdmin?: boolean;
}

@Injectable()
export class TenantContextService {
  private readonly als = new AsyncLocalStorage<TenantStore>();

  run<T>(store: TenantStore, callback: () => T): T {
    return this.als.run(store, callback);
  }

  getTenantId(): string | undefined {
    return this.als.getStore()?.tenantId;
  }

  isSuperAdmin(): boolean {
    return this.als.getStore()?.isSuperAdmin === true;
  }

  requireTenantId(): string {
    const tenantId = this.getTenantId();
    if (!tenantId) {
      throw new Error('Tenant context not set. Ensure TenantContextInterceptor is active.');
    }
    return tenantId;
  }
}
