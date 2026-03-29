import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CloneProfileCommand } from './clone-profile.command';

@CommandHandler(CloneProfileCommand)
export class CloneProfileHandler implements ICommandHandler<CloneProfileCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CloneProfileCommand) {
    const source = await this.prisma.working.importProfile.findUniqueOrThrow({ where: { id: cmd.profileId } });
    return this.prisma.working.importProfile.create({
      data: {
        name: cmd.newName,
        description: source.description ? `Clone of ${source.name}: ${source.description}` : `Clone of ${source.name}`,
        sourceSystem: source.sourceSystem,
        icon: source.icon,
        color: source.color,
        targetEntity: source.targetEntity,
        expectedHeaders: source.expectedHeaders,
        headerMatchMode: source.headerMatchMode,
        fieldMapping: source.fieldMapping as any,
        defaultValues: source.defaultValues || undefined,
        validationRules: source.validationRules || undefined,
        duplicateCheckFields: source.duplicateCheckFields,
        duplicateStrategy: source.duplicateStrategy,
        fuzzyMatchEnabled: source.fuzzyMatchEnabled,
        fuzzyMatchFields: source.fuzzyMatchFields,
        fuzzyThreshold: source.fuzzyThreshold,
        createdById: cmd.createdById,
        createdByName: cmd.createdByName,
      },
    });
  }
}
