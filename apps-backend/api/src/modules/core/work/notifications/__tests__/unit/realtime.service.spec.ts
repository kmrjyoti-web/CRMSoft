import { RealtimeService } from '../../services/realtime.service';
import { firstValueFrom, take, toArray } from 'rxjs';

describe('RealtimeService', () => {
  let service: RealtimeService;

  beforeEach(() => {
    service = new RealtimeService();
  });

  it('should register and track connections', () => {
    service.registerConnection('u-1', 'socket-1');
    service.registerConnection('u-1', 'socket-2');
    expect(service.isUserOnline('u-1')).toBe(true);
    expect(service.getConnectionCount('u-1')).toBe(2);
  });

  it('should remove connections and detect offline', () => {
    service.registerConnection('u-1', 'socket-1');
    service.removeConnection('u-1', 'socket-1');
    expect(service.isUserOnline('u-1')).toBe(false);
  });

  it('should emit events to user stream', async () => {
    const eventPromise = firstValueFrom(service.getUserStream('u-1').pipe(take(1)));
    service.sendToUser('u-1', { type: 'notification', payload: { id: 'n-1' } });
    const event = await eventPromise;
    expect(event.type).toBe('notification');
    expect(event.payload.id).toBe('n-1');
  });

  it('should only deliver events to intended user', async () => {
    const events: any[] = [];
    const sub = service.getUserStream('u-2').pipe(take(1)).subscribe(e => events.push(e));
    service.sendToUser('u-1', { type: 'test', payload: {} });

    // u-2 should not receive u-1's event
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(events.length).toBe(0);
    sub.unsubscribe();
  });

  it('should list online user IDs', () => {
    service.registerConnection('u-1', 's-1');
    service.registerConnection('u-2', 's-2');
    const online = service.getOnlineUserIds();
    expect(online).toContain('u-1');
    expect(online).toContain('u-2');
  });

  describe('edge cases', () => {
    it('should return false for isUserOnline when user never registered', () => {
      expect(service.isUserOnline('never-connected')).toBe(false);
    });

    it('should return 0 connectionCount for unknown user', () => {
      expect(service.getConnectionCount('unknown')).toBe(0);
    });

    it('should handle removeConnection gracefully when user has no connections', () => {
      expect(() => service.removeConnection('ghost-user', 'socket-99')).not.toThrow();
      expect(service.isUserOnline('ghost-user')).toBe(false);
    });
  });
});
