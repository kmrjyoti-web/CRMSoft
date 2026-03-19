import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateMenuHandler } from '../../application/commands/create-menu/create-menu.handler';
import { CreateMenuCommand } from '../../application/commands/create-menu/create-menu.command';

describe('CreateMenuHandler', () => {
  let handler: CreateMenuHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      menu: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((args) => ({
          id: 'menu-1', ...args.data,
        })),
      },
    };
    (prisma as any).identity = prisma;
    (prisma as any).platform = prisma;
    handler = new CreateMenuHandler(prisma);
  });

  it('should create menu with auto-generated code from name', async () => {
    const result = await handler.execute(
      new CreateMenuCommand('Leads Management'),
    );
    expect(result.code).toBe('LEADS_MANAGEMENT');
    expect(result.name).toBe('Leads Management');
    expect(prisma.menu.create).toHaveBeenCalled();
  });

  it('should throw ConflictException on duplicate code', async () => {
    prisma.menu.findFirst.mockResolvedValue({ id: 'existing' });
    await expect(
      handler.execute(new CreateMenuCommand('Test', 'DUPLICATE')),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw NotFoundException if parentId is invalid', async () => {
    // First call for code check via findFirst → null (no conflict)
    // findUnique for parent check → null (not found)
    prisma.menu.findFirst.mockResolvedValueOnce(null); // code check
    prisma.menu.findUnique.mockResolvedValueOnce(null); // parent check
    await expect(
      handler.execute(new CreateMenuCommand('Child', undefined, undefined, undefined, 'bad-parent')),
    ).rejects.toThrow(NotFoundException);
  });

  it('should auto-uppercase code from name', async () => {
    const result = await handler.execute(
      new CreateMenuCommand('raw contacts list'),
    );
    expect(result.code).toBe('RAW_CONTACTS_LIST');
  });

  it('should set default menuType to ITEM', async () => {
    const result = await handler.execute(
      new CreateMenuCommand('Dashboard'),
    );
    expect(result.menuType).toBe('ITEM');
  });
});
