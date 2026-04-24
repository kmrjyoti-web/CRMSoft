import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { CreateFieldDefinitionCommand } from './create-field-definition.command';

@CommandHandler(CreateFieldDefinitionCommand)
export class CreateFieldDefinitionHandler
  implements ICommandHandler<CreateFieldDefinitionCommand>
{
    private readonly logger = new Logger(CreateFieldDefinitionHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateFieldDefinitionCommand) {
    try {
      const existing = await this.prisma.customFieldDefinition.findFirst({
        where: {
          entityType: cmd.entityType.toUpperCase(),
          fieldName: cmd.fieldName,
        },
      });
      if (existing) {
        throw new ConflictException(
          `Field '${cmd.fieldName}' already exists for ${cmd.entityType}`,
        );
      }
      return this.prisma.customFieldDefinition.create({
        data: {
          entityType: cmd.entityType.toUpperCase(),
          fieldName: cmd.fieldName,
          fieldLabel: cmd.fieldLabel,
          fieldType: cmd.fieldType.toUpperCase(),
          isRequired: cmd.isRequired ?? false,
          defaultValue: cmd.defaultValue,
          options: cmd.options as any,
          sortOrder: cmd.sortOrder ?? 0,
        },
      });
    } catch (error) {
      this.logger.error(`CreateFieldDefinitionHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
