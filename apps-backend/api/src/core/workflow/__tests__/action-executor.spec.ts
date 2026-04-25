import { ActionExecutorService } from '../action-executor.service';
import { WorkflowActionContext } from '../interfaces/action-handler.interface';

describe('ActionExecutorService', () => {
  let service: ActionExecutorService;
  let prisma: any;
  let templateResolver: any;
  let fieldUpdate: any;
  let sendEmail: any;
  let sendNotification: any;
  let createActivity: any;
  let createTask: any;
  let webhook: any;
  let assignOwner: any;

  const context: WorkflowActionContext = {
    instanceId: 'inst-1', entityType: 'LEAD', entityId: 'lead-1',
    entity: { name: 'Test Lead' },
    performer: { id: 'user-1', firstName: 'Raj', lastName: 'Patel', email: 'raj@crm.com' },
    currentState: { name: 'In Progress', code: 'IN_PROGRESS' },
    timestamp: new Date(),
  };

  beforeEach(() => {
    prisma = { workflowActionLog: { create: jest.fn().mockResolvedValue({}) } };
(prisma as any).working = prisma;
    templateResolver = { resolveObject: jest.fn((obj) => obj) };

    const mockHandler = (type: string) => ({
      type,
      execute: jest.fn().mockResolvedValue({ status: 'SUCCESS', result: { done: true } }),
    });

    fieldUpdate = mockHandler('FIELD_UPDATE');
    sendEmail = mockHandler('SEND_EMAIL');
    sendNotification = mockHandler('SEND_NOTIFICATION');
    createActivity = mockHandler('CREATE_ACTIVITY');
    createTask = mockHandler('CREATE_TASK');
    webhook = mockHandler('WEBHOOK');
    assignOwner = mockHandler('ASSIGN_OWNER');

    service = new ActionExecutorService(
      prisma, templateResolver,
      fieldUpdate, sendEmail, sendNotification, createActivity, createTask, webhook, assignOwner,
    );
  });

  it('should do nothing when actions is null or empty', async () => {
    await service.executeAll(null, context, 'inst-1', 'tr-1');
    await service.executeAll([], context, 'inst-1', 'tr-1');
    expect(prisma.workflowActionLog.create).not.toHaveBeenCalled();
  });

  it('should execute a FIELD_UPDATE action and log it', async () => {
    const actions = [{ type: 'FIELD_UPDATE', config: { field: 'status', value: 'WON' } }];
    await service.executeAll(actions, context, 'inst-1', 'tr-1');

    expect(templateResolver.resolveObject).toHaveBeenCalledWith({ field: 'status', value: 'WON' }, context);
    expect(fieldUpdate.execute).toHaveBeenCalled();
    expect(prisma.workflowActionLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ actionType: 'FIELD_UPDATE', status: 'SUCCESS' }) }),
    );
  });

  it('should execute multiple actions sequentially', async () => {
    const actions = [
      { type: 'SEND_EMAIL', config: { to: 'test@test.com' } },
      { type: 'CREATE_ACTIVITY', config: { subject: 'Follow up' } },
    ];
    await service.executeAll(actions, context, 'inst-1', 'tr-1');

    expect(sendEmail.execute).toHaveBeenCalled();
    expect(createActivity.execute).toHaveBeenCalled();
    expect(prisma.workflowActionLog.create).toHaveBeenCalledTimes(2);
  });

  it('should skip unknown action types', async () => {
    const actions = [{ type: 'UNKNOWN_ACTION', config: {} }];
    await service.executeAll(actions, context, 'inst-1', 'tr-1');

    expect(prisma.workflowActionLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'SKIPPED' }) }),
    );
  });

  it('should catch handler errors and log FAILED status', async () => {
    fieldUpdate.execute.mockRejectedValueOnce(new Error('DB connection failed'));
    const actions = [{ type: 'FIELD_UPDATE', config: { field: 'status' } }];
    await service.executeAll(actions, context, 'inst-1', 'tr-1');

    expect(prisma.workflowActionLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'FAILED', errorMessage: 'DB connection failed' }) }),
    );
  });

  it('should execute WEBHOOK action with resolved config', async () => {
    templateResolver.resolveObject.mockReturnValueOnce({ url: 'https://api.example.com/hook', method: 'POST' });
    const actions = [{ type: 'WEBHOOK', config: { url: '{{entity.webhookUrl}}', method: 'POST' } }];
    await service.executeAll(actions, context, 'inst-1', 'tr-1');

    expect(webhook.execute).toHaveBeenCalledWith(
      { url: 'https://api.example.com/hook', method: 'POST' }, context,
    );
  });
});
