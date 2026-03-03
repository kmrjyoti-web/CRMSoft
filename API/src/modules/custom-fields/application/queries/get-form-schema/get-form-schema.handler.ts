import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetFormSchemaQuery } from './get-form-schema.query';

@QueryHandler(GetFormSchemaQuery)
export class GetFormSchemaHandler
  implements IQueryHandler<GetFormSchemaQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetFormSchemaQuery) {
    const definitions = await this.prisma.customFieldDefinition.findMany({
      where: { entityType: query.entityType.toUpperCase(), isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return definitions.map((d) => ({
      definitionId: d.id,
      fieldName: d.fieldName,
      fieldLabel: d.fieldLabel,
      fieldType: d.fieldType,
      isRequired: d.isRequired,
      defaultValue: d.defaultValue,
      options: d.options,
      sortOrder: d.sortOrder,
      valueColumn: this.getValueColumn(d.fieldType),
    }));
  }

  private getValueColumn(fieldType: string): string {
    const map: Record<string, string> = {
      TEXT: 'valueText',
      NUMBER: 'valueNumber',
      DATE: 'valueDate',
      BOOLEAN: 'valueBoolean',
      JSON: 'valueJson',
      DROPDOWN: 'valueDropdown',
    };
    return map[fieldType] ?? 'valueText';
  }
}
