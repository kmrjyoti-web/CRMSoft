import { ConflictException } from '@nestjs/common';
import { CreateFieldDefinitionHandler } from '../../application/commands/create-field-definition/create-field-definition.handler';
import { CreateFieldDefinitionCommand } from '../../application/commands/create-field-definition/create-field-definition.command';

describe('CreateFieldDefinitionHandler', () => {
  let handler: CreateFieldDefinitionHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      customFieldDefinition: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((args) => ({ id: 'cf-1', ...args.data })),
      },
    };
    handler = new CreateFieldDefinitionHandler(prisma);
  });

  it('should create a field definition', async () => {
    const result = await handler.execute(
      new CreateFieldDefinitionCommand('lead', 'custom_score', 'Score', 'NUMBER'),
    );
    expect(result.entityType).toBe('LEAD');
    expect(result.fieldType).toBe('NUMBER');
    expect(result.fieldName).toBe('custom_score');
  });

  it('should throw ConflictException for duplicate field', async () => {
    prisma.customFieldDefinition.findFirst.mockResolvedValue({ id: 'existing' });
    await expect(
      handler.execute(
        new CreateFieldDefinitionCommand('lead', 'custom_score', 'Score', 'NUMBER'),
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('should set defaults for optional fields', async () => {
    const result = await handler.execute(
      new CreateFieldDefinitionCommand('contact', 'notes', 'Notes', 'TEXT'),
    );
    expect(result.isRequired).toBe(false);
    expect(result.sortOrder).toBe(0);
  });
});
