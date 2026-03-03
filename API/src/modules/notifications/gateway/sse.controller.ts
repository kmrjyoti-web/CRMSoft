import { Controller, Sse, Query, Req, MessageEvent } from '@nestjs/common';
import { Observable, interval, merge } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { RealtimeService } from '../services/realtime.service';

@Controller('notifications/sse')
export class SseController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Sse('stream')
  stream(@Query('userId') userId: string): Observable<MessageEvent> {
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
