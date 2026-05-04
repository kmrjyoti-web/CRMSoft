import { CommitImportHandler } from '../../application/commands/commit-import/commit-import.handler';
import { CommitImportCommand } from '../../application/commands/commit-import/commit-import.command';

describe('CommitImportHandler', () => {
  let handler: CommitImportHandler;
  let prisma: any;
  let executor: any;
  let reportService: any;

  beforeEach(() => {
    prisma = {
      importJob: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'j1', targetEntity: 'CONTACT', totalRows: 3, profileId: 'p1',
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      importRow: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'r1', rowNumber: 1, rowStatus: 'VALID', mappedData: { firstName: 'A' }, userAction: null, duplicateOfEntityId: null, userEditedData: null },
          { id: 'r2', rowNumber: 2, rowStatus: 'INVALID', mappedData: { firstName: 'B' }, userAction: null, duplicateOfEntityId: null, userEditedData: null },
          { id: 'r3', rowNumber: 3, rowStatus: 'VALID', mappedData: { firstName: 'C' }, userAction: null, duplicateOfEntityId: null, userEditedData: null },
        ]),
        update: jest.fn().mockResolvedValue({}),
      },
      importProfile: {
        update: jest.fn().mockResolvedValue({}),
      },
    };
(prisma as any).working = prisma;
    executor = {
      executeRow: jest.fn().mockResolvedValue({ rowNumber: 1, success: true, action: 'CREATED', entityId: 'e1' }),
    };
    reportService = {
      generateReport: jest.fn().mockResolvedValue({ fullPath: '/report.xlsx', failedPath: '/failed.xlsx' }),
    };
    handler = new CommitImportHandler(prisma, executor, reportService);
  });

  it('should update profile stats after import', async () => {
    const result = await handler.execute(new CommitImportCommand('j1', 'user1'));

    expect(prisma.importProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'p1' } }),
    );
  });

  it('should auto-generate result report', async () => {
    await handler.execute(new CommitImportCommand('j1', 'user1'));
    expect(reportService.generateReport).toHaveBeenCalledWith('j1');
  });
});
