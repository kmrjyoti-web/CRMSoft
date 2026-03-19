import { NotFoundException } from '@nestjs/common';
import { GetValuesByCategoryHandler } from '../../application/queries/get-values-by-category/get-values-by-category.handler';
import { GetValuesByCategoryQuery } from '../../application/queries/get-values-by-category/get-values-by-category.query';

describe('GetValuesByCategoryHandler', () => {
  let handler: GetValuesByCategoryHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      masterLookup: {
        findFirst: jest.fn().mockResolvedValue({ id: 'lk-1', category: 'INDUSTRY', displayName: 'Industry' }),
      },
      lookupValue: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'v1', value: 'IT', label: 'IT / Software', rowIndex: 0 },
          { id: 'v2', value: 'FINANCE', label: 'Finance', rowIndex: 1 },
        ]),
      },
    };
    handler = new GetValuesByCategoryHandler(prisma);
  });

  it('should return values for category', async () => {
    const result = await handler.execute(new GetValuesByCategoryQuery('industry'));
    expect(result.category).toBe('INDUSTRY');
    expect(result.values).toHaveLength(2);
  });

  it('should uppercase category', async () => {
    await handler.execute(new GetValuesByCategoryQuery('lead_source'));
    expect(prisma.masterLookup.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { category: 'LEAD_SOURCE' } }),
    );
  });

  it('should throw NotFoundException', async () => {
    prisma.masterLookup.findFirst.mockResolvedValue(null);
    await expect(handler.execute(new GetValuesByCategoryQuery('INVALID')))
      .rejects.toThrow(NotFoundException);
  });
});
