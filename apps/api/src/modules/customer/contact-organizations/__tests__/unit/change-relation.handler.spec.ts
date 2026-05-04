import { NotFoundException } from '@nestjs/common';
import { ChangeRelationTypeHandler } from '../../application/commands/change-relation-type/change-relation-type.handler';
import { ChangeRelationTypeCommand } from '../../application/commands/change-relation-type/change-relation-type.command';
import { ContactOrganizationEntity } from '../../domain/entities/contact-organization.entity';

describe('ChangeRelationTypeHandler', () => {
  let handler: ChangeRelationTypeHandler;
  let repo: any;
  let publisher: any;

  beforeEach(() => {
    repo = { save: jest.fn(), findById: jest.fn() };
    publisher = {
      mergeObjectContext: jest.fn((e: any) => { e.commit = jest.fn(); return e; }),
    };
    handler = new ChangeRelationTypeHandler(repo, publisher);
  });

  it('should change EMPLOYEE → DIRECTOR', async () => {
    const mapping = ContactOrganizationEntity.create('m-1', { contactId: 'c-1', organizationId: 'org-1' });
    repo.findById.mockResolvedValue(mapping);
    await handler.execute(new ChangeRelationTypeCommand('m-1', 'DIRECTOR'));
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(handler.execute(new ChangeRelationTypeCommand('m-999', 'DIRECTOR')))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw on invalid relation type', async () => {
    const mapping = ContactOrganizationEntity.create('m-1', { contactId: 'c-1', organizationId: 'org-1' });
    repo.findById.mockResolvedValue(mapping);
    await expect(handler.execute(new ChangeRelationTypeCommand('m-1', 'INVALID')))
      .rejects.toThrow('Invalid relation type');
  });
});
