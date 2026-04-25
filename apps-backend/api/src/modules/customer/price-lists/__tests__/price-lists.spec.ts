// @ts-nocheck
import { NotFoundException } from '@nestjs/common';
import { CreatePriceListHandler } from '../application/commands/create-price-list/create-price-list.handler';
import { CreatePriceListCommand } from '../application/commands/create-price-list/create-price-list.command';
import { DeletePriceListHandler } from '../application/commands/delete-price-list/delete-price-list.handler';
import { DeletePriceListCommand } from '../application/commands/delete-price-list/delete-price-list.command';
import { UpdatePriceListHandler } from '../application/commands/update-price-list/update-price-list.handler';
import { UpdatePriceListCommand } from '../application/commands/update-price-list/update-price-list.command';
import { AddPriceListItemHandler } from '../application/commands/add-price-list-item/add-price-list-item.handler';
import { AddPriceListItemCommand } from '../application/commands/add-price-list-item/add-price-list-item.command';
import { UpdatePriceListItemHandler } from '../application/commands/update-price-list-item/update-price-list-item.handler';
import { UpdatePriceListItemCommand } from '../application/commands/update-price-list-item/update-price-list-item.command';
import { RemovePriceListItemHandler } from '../application/commands/remove-price-list-item/remove-price-list-item.handler';
import { RemovePriceListItemCommand } from '../application/commands/remove-price-list-item/remove-price-list-item.command';
import { ListPriceListsHandler } from '../application/queries/list-price-lists/list-price-lists.handler';
import { ListPriceListsQuery } from '../application/queries/list-price-lists/list-price-lists.query';
import { GetPriceListHandler } from '../application/queries/get-price-list/get-price-list.handler';
import { GetPriceListQuery } from '../application/queries/get-price-list/get-price-list.query';

const makePriceListItem = (overrides = {}) => ({
  id: 'item-1',
  priceListId: 'pl-1',
  productId: 'prod-1',
  sellingPrice: 500,
  minQuantity: 1,
  maxQuantity: null,
  marginPercent: null,
  ...overrides,
});

const makePriceList = (overrides = {}) => ({
  id: 'pl-1',
  name: 'Standard',
  currency: 'INR',
  isActive: true,
  isDeleted: false,
  priority: 0,
  createdById: 'user-1',
  _count: { items: 0 },
  ...overrides,
});

describe('Price Lists', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = {
      working: {
        priceList: {
          create: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
          count: jest.fn(),
        },
        priceListItem: {
          upsert: jest.fn(),
          findUnique: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      },
    };
  });

  afterEach(() => jest.clearAllMocks());

  // ─── CreatePriceListHandler ───────────────────────────────────────────────

  describe('CreatePriceListHandler', () => {
    let handler: CreatePriceListHandler;
    beforeEach(() => { handler = new CreatePriceListHandler(prisma); });

    it('should create a price list with defaults', async () => {
      const created = makePriceList();
      prisma.working.priceList.create.mockResolvedValue(created);
      const cmd = new CreatePriceListCommand({ name: 'Standard' }, 'user-1');
      const result = await handler.execute(cmd);
      expect(result).toEqual(created);
      expect(prisma.working.priceList.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ name: 'Standard', currency: 'INR', isActive: true, priority: 0 }) }),
      );
    });

    it('should create with explicit currency and validFrom/validTo', async () => {
      prisma.working.priceList.create.mockResolvedValue(makePriceList({ currency: 'USD' }));
      const cmd = new CreatePriceListCommand(
        { name: 'USD List', currency: 'USD', validFrom: '2026-01-01', validTo: '2026-12-31', priority: 5 },
        'user-1',
      );
      await handler.execute(cmd);
      const callArg = prisma.working.priceList.create.mock.calls[0][0].data;
      expect(callArg.currency).toBe('USD');
      expect(callArg.priority).toBe(5);
      expect(callArg.validFrom).toBeInstanceOf(Date);
      expect(callArg.validTo).toBeInstanceOf(Date);
    });

    it('should create with isActive=false when explicitly set', async () => {
      prisma.working.priceList.create.mockResolvedValue(makePriceList({ isActive: false }));
      const cmd = new CreatePriceListCommand({ name: 'Inactive List', isActive: false }, 'user-1');
      await handler.execute(cmd);
      expect(prisma.working.priceList.create.mock.calls[0][0].data.isActive).toBe(false);
    });

    it('should store createdById on the record', async () => {
      prisma.working.priceList.create.mockResolvedValue(makePriceList({ createdById: 'admin-5' }));
      const cmd = new CreatePriceListCommand({ name: 'X' }, 'admin-5');
      await handler.execute(cmd);
      expect(prisma.working.priceList.create.mock.calls[0][0].data.createdById).toBe('admin-5');
    });
  });

  // ─── DeletePriceListHandler ───────────────────────────────────────────────

  describe('DeletePriceListHandler', () => {
    let handler: DeletePriceListHandler;
    beforeEach(() => { handler = new DeletePriceListHandler(prisma); });

    it('should soft-delete an existing price list', async () => {
      prisma.working.priceList.findFirst.mockResolvedValue(makePriceList());
      prisma.working.priceList.update.mockResolvedValue({ id: 'pl-1', isDeleted: true });
      const result = await handler.execute(new DeletePriceListCommand('pl-1'));
      expect(result).toEqual({ id: 'pl-1', deleted: true });
      expect(prisma.working.priceList.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ isDeleted: true }) }),
      );
    });

    it('should throw NotFoundException when price list not found', async () => {
      prisma.working.priceList.findFirst.mockResolvedValue(null);
      await expect(handler.execute(new DeletePriceListCommand('missing'))).rejects.toThrow(NotFoundException);
    });

    it('should not delete an already-deleted price list', async () => {
      prisma.working.priceList.findFirst.mockResolvedValue(null); // isDeleted:true excluded by query
      await expect(handler.execute(new DeletePriceListCommand('pl-1'))).rejects.toThrow(NotFoundException);
      expect(prisma.working.priceList.update).not.toHaveBeenCalled();
    });

    it('should set deletedAt timestamp on soft-delete', async () => {
      prisma.working.priceList.findFirst.mockResolvedValue(makePriceList());
      prisma.working.priceList.update.mockResolvedValue({});
      await handler.execute(new DeletePriceListCommand('pl-1'));
      const updateData = prisma.working.priceList.update.mock.calls[0][0].data;
      expect(updateData.deletedAt).toBeInstanceOf(Date);
    });
  });

  // ─── ListPriceListsHandler ────────────────────────────────────────────────

  describe('ListPriceListsHandler', () => {
    let handler: ListPriceListsHandler;
    beforeEach(() => { handler = new ListPriceListsHandler(prisma); });

    it('should return paginated price lists', async () => {
      prisma.working.priceList.findMany.mockResolvedValue([makePriceList()]);
      prisma.working.priceList.count.mockResolvedValue(1);
      const result = await handler.execute(new ListPriceListsQuery(1, 20));
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should filter by active status', async () => {
      prisma.working.priceList.findMany.mockResolvedValue([]);
      prisma.working.priceList.count.mockResolvedValue(0);
      await handler.execute(new ListPriceListsQuery(1, 20, undefined, true));
      expect(prisma.working.priceList.findMany.mock.calls[0][0].where.isActive).toBe(true);
    });

    it('should filter by search string', async () => {
      prisma.working.priceList.findMany.mockResolvedValue([]);
      prisma.working.priceList.count.mockResolvedValue(0);
      await handler.execute(new ListPriceListsQuery(1, 20, 'retail'));
      expect(prisma.working.priceList.findMany.mock.calls[0][0].where.name).toEqual(
        expect.objectContaining({ contains: 'retail' }),
      );
    });

    it('should return empty result when no price lists exist', async () => {
      prisma.working.priceList.findMany.mockResolvedValue([]);
      prisma.working.priceList.count.mockResolvedValue(0);
      const result = await handler.execute(new ListPriceListsQuery(1, 20));
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should always exclude deleted records', async () => {
      prisma.working.priceList.findMany.mockResolvedValue([]);
      prisma.working.priceList.count.mockResolvedValue(0);
      await handler.execute(new ListPriceListsQuery(1, 20));
      expect(prisma.working.priceList.findMany.mock.calls[0][0].where.isDeleted).toBe(false);
    });
  });

  // ─── UpdatePriceListHandler ───────────────────────────────────────────────

  describe('UpdatePriceListHandler', () => {
    let handler: UpdatePriceListHandler;
    beforeEach(() => { handler = new UpdatePriceListHandler(prisma); });

    it('should update name and currency', async () => {
      prisma.working.priceList.findFirst.mockResolvedValue(makePriceList());
      prisma.working.priceList.update.mockResolvedValue(makePriceList({ name: 'Premium', currency: 'USD' }));
      const cmd = new UpdatePriceListCommand('pl-1', { name: 'Premium', currency: 'USD' });
      const result = await handler.execute(cmd);
      expect(prisma.working.priceList.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'pl-1' }, data: expect.objectContaining({ name: 'Premium', currency: 'USD' }) }),
      );
      expect(result.name).toBe('Premium');
    });

    it('should throw NotFoundException when price list not found', async () => {
      prisma.working.priceList.findFirst.mockResolvedValue(null);
      await expect(handler.execute(new UpdatePriceListCommand('missing', { name: 'X' }))).rejects.toThrow(NotFoundException);
    });

    it('should convert validFrom and validTo strings to Date objects', async () => {
      prisma.working.priceList.findFirst.mockResolvedValue(makePriceList());
      prisma.working.priceList.update.mockResolvedValue(makePriceList());
      await handler.execute(new UpdatePriceListCommand('pl-1', { validFrom: '2026-01-01', validTo: '2026-12-31' }));
      const updateData = prisma.working.priceList.update.mock.calls[0][0].data;
      expect(updateData.validFrom).toBeInstanceOf(Date);
      expect(updateData.validTo).toBeInstanceOf(Date);
    });

    it('should deactivate price list when isActive set to false', async () => {
      prisma.working.priceList.findFirst.mockResolvedValue(makePriceList());
      prisma.working.priceList.update.mockResolvedValue(makePriceList({ isActive: false }));
      await handler.execute(new UpdatePriceListCommand('pl-1', { isActive: false }));
      expect(prisma.working.priceList.update.mock.calls[0][0].data.isActive).toBe(false);
    });
  });

  // ─── GetPriceListHandler ──────────────────────────────────────────────────

  describe('GetPriceListHandler', () => {
    let handler: GetPriceListHandler;
    beforeEach(() => { handler = new GetPriceListHandler(prisma); });

    it('should return price list with items', async () => {
      const pl = { ...makePriceList(), items: [makePriceListItem()] };
      prisma.working.priceList.findFirst.mockResolvedValue(pl);
      const result = await handler.execute(new GetPriceListQuery('pl-1'));
      expect(prisma.working.priceList.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'pl-1', isDeleted: false }, include: expect.objectContaining({ items: expect.anything() }) }),
      );
      expect(result.id).toBe('pl-1');
      expect(result.items).toHaveLength(1);
    });

    it('should throw NotFoundException when price list not found', async () => {
      prisma.working.priceList.findFirst.mockResolvedValue(null);
      await expect(handler.execute(new GetPriceListQuery('missing'))).rejects.toThrow(NotFoundException);
    });
  });

  // ─── AddPriceListItemHandler ──────────────────────────────────────────────

  describe('AddPriceListItemHandler', () => {
    let handler: AddPriceListItemHandler;
    beforeEach(() => { handler = new AddPriceListItemHandler(prisma); });

    it('should upsert a price list item with defaults', async () => {
      prisma.working.priceListItem.upsert.mockResolvedValue(makePriceListItem());
      const cmd = new AddPriceListItemCommand('pl-1', { productId: 'prod-1', sellingPrice: 500 });
      const result = await handler.execute(cmd);
      expect(prisma.working.priceListItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ create: expect.objectContaining({ priceListId: 'pl-1', productId: 'prod-1', sellingPrice: 500, minQuantity: 1 }) }),
      );
      expect(result.id).toBe('item-1');
    });

    it('should use provided minQuantity when specified', async () => {
      prisma.working.priceListItem.upsert.mockResolvedValue(makePriceListItem({ minQuantity: 10 }));
      await handler.execute(new AddPriceListItemCommand('pl-1', { productId: 'prod-1', sellingPrice: 400, minQuantity: 10 }));
      expect(prisma.working.priceListItem.upsert.mock.calls[0][0].create.minQuantity).toBe(10);
    });

    it('should update sellingPrice when item already exists (upsert update path)', async () => {
      const updated = makePriceListItem({ sellingPrice: 600 });
      prisma.working.priceListItem.upsert.mockResolvedValue(updated);
      const result = await handler.execute(new AddPriceListItemCommand('pl-1', { productId: 'prod-1', sellingPrice: 600 }));
      expect(prisma.working.priceListItem.upsert.mock.calls[0][0].update.sellingPrice).toBe(600);
      expect(result.sellingPrice).toBe(600);
    });
  });

  // ─── UpdatePriceListItemHandler ───────────────────────────────────────────

  describe('UpdatePriceListItemHandler', () => {
    let handler: UpdatePriceListItemHandler;
    beforeEach(() => { handler = new UpdatePriceListItemHandler(prisma); });

    it('should update sellingPrice on existing item', async () => {
      prisma.working.priceListItem.findUnique.mockResolvedValue(makePriceListItem());
      prisma.working.priceListItem.update.mockResolvedValue(makePriceListItem({ sellingPrice: 750 }));
      const result = await handler.execute(new UpdatePriceListItemCommand('item-1', { sellingPrice: 750 }));
      expect(prisma.working.priceListItem.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'item-1' }, data: expect.objectContaining({ sellingPrice: 750 }) }),
      );
      expect(result.sellingPrice).toBe(750);
    });

    it('should throw NotFoundException when item not found', async () => {
      prisma.working.priceListItem.findUnique.mockResolvedValue(null);
      await expect(handler.execute(new UpdatePriceListItemCommand('missing', { sellingPrice: 100 }))).rejects.toThrow(NotFoundException);
    });

    it('should not include undefined fields in update payload', async () => {
      prisma.working.priceListItem.findUnique.mockResolvedValue(makePriceListItem());
      prisma.working.priceListItem.update.mockResolvedValue(makePriceListItem());
      await handler.execute(new UpdatePriceListItemCommand('item-1', { marginPercent: 15 }));
      const updateData = prisma.working.priceListItem.update.mock.calls[0][0].data;
      expect(updateData.sellingPrice).toBeUndefined();
      expect(updateData.marginPercent).toBe(15);
    });
  });

  // ─── RemovePriceListItemHandler ───────────────────────────────────────────

  describe('RemovePriceListItemHandler', () => {
    let handler: RemovePriceListItemHandler;
    beforeEach(() => { handler = new RemovePriceListItemHandler(prisma); });

    it('should delete item and return confirmation', async () => {
      prisma.working.priceListItem.findUnique.mockResolvedValue(makePriceListItem());
      const result = await handler.execute(new RemovePriceListItemCommand('item-1'));
      expect(prisma.working.priceListItem.delete).toHaveBeenCalledWith({ where: { id: 'item-1' } });
      expect(result).toEqual({ id: 'item-1', deleted: true });
    });

    it('should throw NotFoundException when item not found', async () => {
      prisma.working.priceListItem.findUnique.mockResolvedValue(null);
      await expect(handler.execute(new RemovePriceListItemCommand('missing'))).rejects.toThrow(NotFoundException);
      expect(prisma.working.priceListItem.delete).not.toHaveBeenCalled();
    });
  });
});
