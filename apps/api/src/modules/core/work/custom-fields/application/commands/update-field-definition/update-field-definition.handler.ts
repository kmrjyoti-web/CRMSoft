import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { UpdateFieldDefinitionCommand } from './update-field-definition.command';

@CommandHandler(UpdateFieldDefinitionCommand)
export class UpdateFieldDefinitionHandler
  implements ICommandHandler<UpdateFieldDefinitionCommand>
{
    private readonly logger = new Logger(UpdateFieldDefinitionHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateFieldDefinitionCommand) {
    try {
      return this.prisma.customFieldDefinition.update({
        where: { id: cmd.id },
        data: cmd.data as any,
      });
    } catch (error) {
      this.logger.error(`UpdateFieldDefinitionHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
