import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RealtimeService } from '../services/realtime.service';
export declare class SseController {
    private readonly realtimeService;
    constructor(realtimeService: RealtimeService);
    stream(userId: string): Observable<MessageEvent>;
}
