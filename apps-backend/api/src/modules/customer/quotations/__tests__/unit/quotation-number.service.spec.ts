import { QuotationNumberService } from '../../services/quotation-number.service';

describe('QuotationNumberService', () => {
  const year = new Date().getFullYear();

  function makeService(lastQuotationNo: string | null) {
    const prisma = {
      working: {
        quotation: {
          findFirst: jest.fn().mockResolvedValue(
            lastQuotationNo ? { quotationNo: lastQuotationNo } : null,
          ),
        },
      },
    };
    return { service: new QuotationNumberService(prisma as any), prisma };
  }

  describe('generateNumber()', () => {
    it('should generate QTN-YYYY-00001 when no prior quotations exist', async () => {
      const { service } = makeService(null);
      const number = await service.generateNumber();
      expect(number).toBe(`QTN-${year}-00001`);
    });

    it('should increment from last sequential number', async () => {
      const { service } = makeService(`QTN-${year}-00042`);
      const number = await service.generateNumber();
      expect(number).toBe(`QTN-${year}-00043`);
    });

    it('should zero-pad sequence to 5 digits', async () => {
      const { service } = makeService(`QTN-${year}-00009`);
      const number = await service.generateNumber();
      expect(number).toBe(`QTN-${year}-00010`);
    });

    it('should scope query to tenantId when provided', async () => {
      const { service, prisma } = makeService(null);
      await service.generateNumber('t-1');
      expect(prisma.working.quotation.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 't-1' }),
        }),
      );
    });

    it('should not include tenantId in query when not provided', async () => {
      const { service, prisma } = makeService(null);
      await service.generateNumber();
      expect(prisma.working.quotation.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({ tenantId: expect.anything() }),
        }),
      );
    });
  });

  describe('generateRevisionNumber()', () => {
    it('should append -R1 for version 2', () => {
      const { service } = makeService(null);
      const result = service.generateRevisionNumber(`QTN-${year}-00001`, 2);
      expect(result).toBe(`QTN-${year}-00001-R1`);
    });

    it('should append -R3 for version 4', () => {
      const { service } = makeService(null);
      const result = service.generateRevisionNumber(`QTN-${year}-00005`, 4);
      expect(result).toBe(`QTN-${year}-00005-R3`);
    });

    it('should strip existing -Rn suffix before appending new one', () => {
      const { service } = makeService(null);
      const result = service.generateRevisionNumber(`QTN-${year}-00001-R1`, 3);
      expect(result).toBe(`QTN-${year}-00001-R2`);
    });
  });
});
