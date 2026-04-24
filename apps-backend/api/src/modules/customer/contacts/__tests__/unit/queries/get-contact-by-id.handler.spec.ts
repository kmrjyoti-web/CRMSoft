import { NotFoundException } from '@nestjs/common';
import { GetContactByIdHandler } from '../../../application/queries/get-contact-by-id/get-contact-by-id.handler';
import { GetContactByIdQuery } from '../../../application/queries/get-contact-by-id/get-contact-by-id.query';

const mockContact = {
  id: 'c-1',
  firstName: 'Priya',
  lastName: 'Sharma',
  isActive: true,
  communications: [],
  contactOrganizations: [],
  leads: [],
  filters: [],
  rawContacts: [],
  createdByUser: { id: 'u-1', firstName: 'Admin', lastName: 'User' },
  _count: { leads: 0, communications: 1, activities: 0 },
};

function makeHandler(contactResult: any = mockContact) {
  const prisma: any = {
    contact: {
      findUnique: jest.fn().mockResolvedValue(contactResult),
    },
  };
  prisma.working = prisma;
  return { handler: new GetContactByIdHandler(prisma), prisma };
}

describe('GetContactByIdHandler', () => {
  it('should return contact when found', async () => {
    const { handler } = makeHandler();
    const result = await handler.execute(new GetContactByIdQuery('c-1'));
    expect(result.id).toBe('c-1');
    expect(result.firstName).toBe('Priya');
  });

  it('should include relations in the query', async () => {
    const { handler, prisma } = makeHandler();
    await handler.execute(new GetContactByIdQuery('c-1'));
    const call = prisma.contact.findUnique.mock.calls[0][0];
    expect(call.where.id).toBe('c-1');
    expect(call.include).toBeDefined();
    expect(call.include.communications).toBeDefined();
    expect(call.include.leads).toBeDefined();
  });

  it('should throw NotFoundException when contact does not exist', async () => {
    const { handler } = makeHandler(null);
    await expect(handler.execute(new GetContactByIdQuery('no-such-id'))).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return inactive contact (handler does not filter by isActive)', async () => {
    const { handler } = makeHandler({ ...mockContact, isActive: false });
    const result = await handler.execute(new GetContactByIdQuery('c-1'));
    expect(result.isActive).toBe(false);
  });
});
