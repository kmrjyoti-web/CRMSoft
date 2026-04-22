import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetFormSchemaQuery } from './get-form-schema.query';

@QueryHandler(GetFormSchemaQuery)
export class GetFormSchemaHandler
  implements IQueryHandler<GetFormSchemaQuery>
{
    private readonly logger = new Logger(GetFormSchemaHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetFormSchemaQuery) {
    try {
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
    } catch (error) {
      this.logger.error(`GetFormSchemaHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
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
