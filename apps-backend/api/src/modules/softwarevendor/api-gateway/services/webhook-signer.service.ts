import { Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class WebhookSignerService {
  sign(payload: Record<string, any>, secret: string): string {
    const body = JSON.stringify(payload);
    return createHmac('sha256', secret).update(body).digest('hex');
  }

  verify(payload: string, signature: string, secret: string): boolean {
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    const sig = signature.replace('sha256=', '');
    try {
      return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
    } catch {
      return false;
    }
  }
}
