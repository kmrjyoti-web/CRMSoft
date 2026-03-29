import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

interface RequestStore {
  requestId: string;
}

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestStore>();

  run<T>(callback: () => T): T {
    const store: RequestStore = { requestId: `req_${randomUUID().replace(/-/g, '').slice(0, 16)}` };
    return this.storage.run(store, callback);
  }

  getRequestId(): string {
    return this.storage.getStore()?.requestId || 'unknown';
  }

  setRequestId(requestId: string): void {
    const store = this.storage.getStore();
    if (store) store.requestId = requestId;
  }
}
