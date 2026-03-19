import { PatchGeneratorService } from '../../services/patch-generator.service';

describe('PatchGeneratorService', () => {
  let service: PatchGeneratorService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      contact: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'c1', firstName: 'Rahul', lastName: 'Sharma',
          designation: null, notes: 'Old notes',
        }),
      },
      organization: { findUnique: jest.fn() },
      lead: { findUnique: jest.fn() },
    };
(prisma as any).working = prisma;
    service = new PatchGeneratorService(prisma);
  });

  it('should show ADD for new fields, UPDATE for changed, NO_CHANGE for same', async () => {
    const patch = await service.generatePatch('c1', {
      firstName: 'Rahul',
      lastName: 'K Sharma',
      designation: 'Manager',
      notes: 'Old notes',
    }, 'CONTACT');

    const add = patch.fields.find(f => f.field === 'designation');
    const update = patch.fields.find(f => f.field === 'lastName');
    const noChange = patch.fields.find(f => f.field === 'firstName');

    expect(add?.action).toBe('ADD');
    expect(update?.action).toBe('UPDATE');
    expect(noChange?.action).toBe('NO_CHANGE');
    expect(patch.hasChanges).toBe(true);
  });

  it('should not show change when empty import value (empty does not overwrite)', async () => {
    const patch = await service.generatePatch('c1', {
      firstName: 'Rahul',
      lastName: '', // empty → should not attempt to clear existing
    }, 'CONTACT');

    const lastNameField = patch.fields.find(f => f.field === 'lastName');
    expect(lastNameField).toBeUndefined();
  });

  it('should generate correct recommendation text', async () => {
    const patch = await service.generatePatch('c1', {
      designation: 'Director',
    }, 'CONTACT');

    const desig = patch.fields.find(f => f.field === 'designation');
    expect(desig?.recommendation).toContain('add');
  });
});
