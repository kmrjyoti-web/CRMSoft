import { Controller, Sse, Query, UnauthorizedException, MessageEvent } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, interval, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import * as jwt from 'jsonwebtoken';
import { Public } from '@/common/decorators/roles.decorator';
import { RealtimeService } from '../services/realtime.service';

@Controller('notifications/sse')
export class SseController {
  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Sse('stream')
  stream(@Query('token') token: string): Observable<MessageEvent> {
    if (!token) throw new UnauthorizedException('Missing token');

    let userId: string;
    try {
      const secret = this.config.get<string>('JWT_SECRET')!;
      const payload = jwt.verify(token, secret) as { sub: string };
      userId = payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    const heartbeat$ = interval(30000).pipe(
      map(() => ({
        data: JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() }),
      } as MessageEvent)),
    );

    const notifications$ = this.realtimeService.getUserStream(userId).pipe(
      map(event => ({
        data: JSON.stringify(event),
        type: event.type,
      } as MessageEvent)),
    );

    return merge(heartbeat$, notifications$);
  }
}
