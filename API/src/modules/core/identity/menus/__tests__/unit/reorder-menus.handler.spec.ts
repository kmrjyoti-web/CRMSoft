import { ReorderMenusHandler } from '../../application/commands/reorder-menus/reorder-menus.handler';
import { ReorderMenusCommand } from '../../application/commands/reorder-menus/reorder-menus.command';

describe('ReorderMenusHandler', () => {
  let handler: ReorderMenusHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      menu: {
        update: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn().mockImplementation((promises) => Promise.all(promises)),
    };
    (prisma as any).identity = prisma;
    (prisma as any).platform = prisma;
    handler = new ReorderMenusHandler(prisma);
  });

  it('should update sortOrder for all IDs', async () => {
    const ids = ['id-a', 'id-b', 'id-c'];
    const result = await handler.execute(new ReorderMenusCommand('parent-1', ids));
    expect(result.reordered).toBe(3);
    expect(prisma.menu.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'id-a' }, data: { sortOrder: 0 } }),
    );
    expect(prisma.menu.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'id-c' }, data: { sortOrder: 2 } }),
    );
  });

  it('should handle root-level reorder (parentId=null)', async () => {
    const ids = ['root-1', 'root-2'];
    const result = await handler.execute(new ReorderMenusCommand(null, ids));
    expect(result.reordered).toBe(2);
  });

  it('should run updates in a transaction', async () => {
    await handler.execute(new ReorderMenusCommand(null, ['a', 'b']));
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Array));
  });
});
