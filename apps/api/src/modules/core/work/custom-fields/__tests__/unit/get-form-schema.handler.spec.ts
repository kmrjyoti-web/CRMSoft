import { GetFormSchemaHandler } from '../../application/queries/get-form-schema/get-form-schema.handler';
import { GetFormSchemaQuery } from '../../application/queries/get-form-schema/get-form-schema.query';

describe('GetFormSchemaHandler', () => {
  let handler: GetFormSchemaHandler;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      customFieldDefinition: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'def-1', fieldName: 'score', fieldLabel: 'Score',
            fieldType: 'NUMBER', isRequired: false, defaultValue: null,
            options: null, sortOrder: 0,
          },
          {
            id: 'def-2', fieldName: 'priority', fieldLabel: 'Priority',
            fieldType: 'DROPDOWN', isRequired: true, defaultValue: 'Medium',
            options: ['Low', 'Medium', 'High'], sortOrder: 1,
          },
          {
            id: 'def-3', fieldName: 'is_vip', fieldLabel: 'VIP Customer',
            fieldType: 'BOOLEAN', isRequired: false, defaultValue: null,
            options: null, sortOrder: 2,
          },
        ]),
      },
    };
    handler = new GetFormSchemaHandler(prisma);
  });

  it('should return form schema with correct value columns', async () => {
    const result = await handler.execute(new GetFormSchemaQuery('LEAD'));
    expect(result.length).toBe(3);
    expect(result[0].valueColumn).toBe('valueNumber');
    expect(result[1].valueColumn).toBe('valueDropdown');
    expect(result[2].valueColumn).toBe('valueBoolean');
  });

  it('should include all field metadata', async () => {
    const result = await handler.execute(new GetFormSchemaQuery('LEAD'));
    const priority = result.find((f: any) => f.fieldName === 'priority')!;
    expect(priority.isRequired).toBe(true);
    expect(priority.defaultValue).toBe('Medium');
    expect(priority.options).toEqual(['Low', 'Medium', 'High']);
  });

  it('should map TEXT fields to valueText column', async () => {
    prisma.customFieldDefinition.findMany.mockResolvedValue([
      {
        id: 'def-4', fieldName: 'description', fieldLabel: 'Description',
        fieldType: 'TEXT', isRequired: false, defaultValue: null,
        options: null, sortOrder: 0,
      },
    ]);
    const result = await handler.execute(new GetFormSchemaQuery('CONTACT'));
    expect(result[0].valueColumn).toBe('valueText');
  });
});
