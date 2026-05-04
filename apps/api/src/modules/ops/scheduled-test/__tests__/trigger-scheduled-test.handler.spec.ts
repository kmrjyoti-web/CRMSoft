import { NotFoundException } from '@nestjs/common';
import { TriggerScheduledTestHandler } from '../application/commands/trigger-scheduled-test/trigger-scheduled-test.handler';
import { TriggerScheduledTestCommand } from '../application/commands/trigger-scheduled-test/trigger-scheduled-test.command';

const mockTestRepo = {
  findById: jest.fn(),
  update: jest.fn(),
};

const mockRunRepo = {
  create: jest.fn(),
};

const mockQueue = {
  add: jest.fn().mockResolvedValue({ id: 'job-1' }),
};

function buildHandler() {
  return new TriggerScheduledTestHandler(
    mockTestRepo as any,
    mockRunRepo as any,
    mockQueue as any,
  );
}

describe('TriggerScheduledTestHandler', () => {
  afterEach(() => jest.clearAllMocks());

  it('throws NotFoundException when scheduled test not found', async () => {
    mockTestRepo.findById.mockResolvedValue(null);

    await expect(
      buildHandler().execute(new TriggerScheduledTestCommand('st-99', 't-1', 'u-1')),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(mockRunRepo.create).not.toHaveBeenCalled();
    expect(mockQueue.add).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when test belongs to different tenant', async () => {
    mockTestRepo.findById.mockResolvedValue({ id: 'st-1', tenantId: 'OTHER_TENANT' });

    await expect(
      buildHandler().execute(new TriggerScheduledTestCommand('st-1', 't-1', 'u-1')),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates a run record and queues BullMQ job on success', async () => {
    mockTestRepo.findById.mockResolvedValue({ id: 'st-1', tenantId: 't-1', name: 'Test' });
    mockRunRepo.create.mockResolvedValue({ id: 'run-1', scheduledTestId: 'st-1', status: 'QUEUED' });

    const result = await buildHandler().execute(
      new TriggerScheduledTestCommand('st-1', 't-1', 'u-1'),
    );

    expect(result).toEqual({ runId: 'run-1' });
    expect(mockRunRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ scheduledTestId: 'st-1', status: 'QUEUED' }),
    );
    expect(mockQueue.add).toHaveBeenCalledWith(
      'EXECUTE_SCHEDULED_TEST',
      expect.objectContaining({ scheduledTestId: 'st-1', scheduledTestRunId: 'run-1', triggeredBy: 'u-1' }),
      expect.any(Object),
    );
  });
});
