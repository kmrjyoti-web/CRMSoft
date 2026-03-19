import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { DeleteFieldDefinitionCommand } from './delete-field-definition.command';

@CommandHandler(DeleteFieldDefinitionCommand)
export class DeleteFieldDefinitionHandler
  implements ICommandHandler<DeleteFieldDefinitionCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DeleteFieldDefinitionCommand) {
    await this.prisma.customFieldDefinition.update({
      where: { id: cmd.id },
      data: { isActive: false },
    });
    return { deactivated: true };
  }
}
