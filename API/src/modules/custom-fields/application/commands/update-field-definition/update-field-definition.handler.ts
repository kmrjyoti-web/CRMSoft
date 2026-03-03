import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { UpdateFieldDefinitionCommand } from './update-field-definition.command';

@CommandHandler(UpdateFieldDefinitionCommand)
export class UpdateFieldDefinitionHandler
  implements ICommandHandler<UpdateFieldDefinitionCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateFieldDefinitionCommand) {
    return this.prisma.customFieldDefinition.update({
      where: { id: cmd.id },
      data: cmd.data,
    });
  }
}
