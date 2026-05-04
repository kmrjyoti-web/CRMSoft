import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { DeleteFieldDefinitionCommand } from './delete-field-definition.command';

@CommandHandler(DeleteFieldDefinitionCommand)
export class DeleteFieldDefinitionHandler
  implements ICommandHandler<DeleteFieldDefinitionCommand>
{
    private readonly logger = new Logger(DeleteFieldDefinitionHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DeleteFieldDefinitionCommand) {
    try {
      await this.prisma.customFieldDefinition.update({
        where: { id: cmd.id },
        data: { isActive: false },
      });
      return { deactivated: true };
    } catch (error) {
      this.logger.error(`DeleteFieldDefinitionHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
