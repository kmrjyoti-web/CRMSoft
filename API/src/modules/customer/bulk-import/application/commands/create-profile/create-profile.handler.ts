import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CreateProfileCommand } from './create-profile.command';

@CommandHandler(CreateProfileCommand)
export class CreateProfileHandler implements ICommandHandler<CreateProfileCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateProfileCommand) {
    return this.prisma.importProfile.create({
      data: {
        name: cmd.name,
        description: cmd.description,
        sourceSystem: cmd.sourceSystem,
        icon: cmd.icon,
        color: cmd.color,
        targetEntity: cmd.targetEntity as any,
        expectedHeaders: cmd.expectedHeaders,
        fieldMapping: cmd.fieldMapping,
        defaultValues: cmd.defaultValues || undefined,
        validationRules: cmd.validationRules || undefined,
        duplicateCheckFields: cmd.duplicateCheckFields || [],
        duplicateStrategy: (cmd.duplicateStrategy as any) || 'ASK_PER_ROW',
        fuzzyMatchEnabled: cmd.fuzzyMatchEnabled || false,
        fuzzyMatchFields: cmd.fuzzyMatchFields || [],
        fuzzyThreshold: cmd.fuzzyThreshold || 0.85,
        createdById: cmd.createdById,
        createdByName: cmd.createdByName,
      },
    });
  }
}
