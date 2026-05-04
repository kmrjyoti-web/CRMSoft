import { SendNotificationHandler } from '../../application/commands/send-notification/send-notification.handler';
import { SendNotificationCommand } from '../../application/commands/send-notification/send-notification.command';
import { UpdatePreferencesHandler } from '../../application/commands/update-preferences/update-preferences.handler';
import { UpdatePreferencesCommand } from '../../application/commands/update-preferences/update-preferences.command';
import { UnregisterPushHandler } from '../../application/commands/unregister-push/unregister-push.handler';
import { UnregisterPushCommand } from '../../application/commands/unregister-push/unregister-push.command';
import { ChannelRouterService } from '../../services/channel-router.service';
import { PreferenceService } from '../../services/preference.service';

// --- SendNotificationHandler ---

describe('SendNotificationHandler', () => {
  function makeHandler(sendResult: any = { id: 'notif-1' }) {
    const channelRouter = {
      send: jest.fn().mockResolvedValue(sendResult),
    } as unknown as ChannelRouterService;
    return { handler: new SendNotificationHandler(channelRouter), channelRouter };
  }

  it('should delegate to channelRouter.send with all fields', async () => {
    const { handler, channelRouter } = makeHandler();

    const cmd = new SendNotificationCommand(
      'LEAD_ASSIGNED',
      'user-1',
      { leadName: 'Ravi' },
      'system',
      'LEAD',
      'lead-42',
      'HIGH',
      'lead-group',
      ['EMAIL', 'SMS'],
    );

    const result = await handler.execute(cmd);

    expect(channelRouter.send).toHaveBeenCalledWith({
      templateName: 'LEAD_ASSIGNED',
      recipientId: 'user-1',
      senderId: 'system',
      variables: { leadName: 'Ravi' },
      entityType: 'LEAD',
      entityId: 'lead-42',
      priority: 'HIGH',
      groupKey: 'lead-group',
      channelOverrides: ['EMAIL', 'SMS'],
    });
    expect(result).toEqual({ id: 'notif-1' });
  });

  it('should work with minimal required fields only', async () => {
    const { handler, channelRouter } = makeHandler();

    await handler.execute(new SendNotificationCommand('WELCOME', 'user-2', {}));

    expect(channelRouter.send).toHaveBeenCalledWith(
      expect.objectContaining({ templateName: 'WELCOME', recipientId: 'user-2' }),
    );
  });

  it('should rethrow errors from channelRouter', async () => {
    const channelRouter = {
      send: jest.fn().mockRejectedValue(new Error('channel error')),
    } as unknown as ChannelRouterService;
    const handler = new SendNotificationHandler(channelRouter);

    await expect(
      handler.execute(new SendNotificationCommand('FAIL', 'user-1', {})),
    ).rejects.toThrow('channel error');
  });
});

// --- UpdatePreferencesHandler ---

describe('UpdatePreferencesHandler', () => {
  function makeHandler(updateResult: any = { userId: 'user-1', channels: {} }) {
    const preferenceService = {
      updatePreferences: jest.fn().mockResolvedValue(updateResult),
    } as unknown as PreferenceService;
    return { handler: new UpdatePreferencesHandler(preferenceService), preferenceService };
  }

  it('should delegate to preferenceService.updatePreferences with all fields', async () => {
    const { handler, preferenceService } = makeHandler();

    const cmd = new UpdatePreferencesCommand(
      'user-1',
      { EMAIL: true, SMS: false },
      { LEAD: true },
      '22:00',
      '06:00',
      'DAILY',
      'Asia/Kolkata',
    );

    const result = await handler.execute(cmd);

    expect(preferenceService.updatePreferences).toHaveBeenCalledWith('user-1', {
      channels: { EMAIL: true, SMS: false },
      categories: { LEAD: true },
      quietHoursStart: '22:00',
      quietHoursEnd: '06:00',
      digestFrequency: 'DAILY',
      timezone: 'Asia/Kolkata',
    });
    expect(result).toMatchObject({ userId: 'user-1' });
  });

  it('should pass undefined fields as undefined (not omit them)', async () => {
    const { handler, preferenceService } = makeHandler();

    await handler.execute(new UpdatePreferencesCommand('user-1'));

    expect(preferenceService.updatePreferences).toHaveBeenCalledWith('user-1', {
      channels: undefined,
      categories: undefined,
      quietHoursStart: undefined,
      quietHoursEnd: undefined,
      digestFrequency: undefined,
      timezone: undefined,
    });
  });

  it('should rethrow errors from preferenceService', async () => {
    const preferenceService = {
      updatePreferences: jest.fn().mockRejectedValue(new Error('DB error')),
    } as unknown as PreferenceService;
    const handler = new UpdatePreferencesHandler(preferenceService);

    await expect(handler.execute(new UpdatePreferencesCommand('user-1'))).rejects.toThrow(
      'DB error',
    );
  });
});

// --- UnregisterPushHandler ---

describe('UnregisterPushHandler', () => {
  function makeHandler(unregResult: any = { deactivated: 1 }) {
    const preferenceService = {
      unregisterPushSubscription: jest.fn().mockResolvedValue(unregResult),
    } as unknown as PreferenceService;
    return { handler: new UnregisterPushHandler(preferenceService), preferenceService };
  }

  it('should call unregisterPushSubscription with userId and endpoint', async () => {
    const { handler, preferenceService } = makeHandler();

    const result = await handler.execute(new UnregisterPushCommand('user-1', 'https://push.endpoint/abc'));

    expect(preferenceService.unregisterPushSubscription).toHaveBeenCalledWith(
      'user-1',
      'https://push.endpoint/abc',
    );
    expect(result).toEqual({ deactivated: 1 });
  });

  it('should rethrow errors from preferenceService', async () => {
    const preferenceService = {
      unregisterPushSubscription: jest.fn().mockRejectedValue(new Error('not found')),
    } as unknown as PreferenceService;
    const handler = new UnregisterPushHandler(preferenceService);

    await expect(
      handler.execute(new UnregisterPushCommand('user-1', 'https://push.endpoint/abc')),
    ).rejects.toThrow('not found');
  });
});
