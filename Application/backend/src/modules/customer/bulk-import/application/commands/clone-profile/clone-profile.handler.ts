import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CloneProfileCommand } from './clone-profile.command';

@CommandHandler(CloneProfileCommand)
export class CloneProfileHandler implements ICommandHandler<CloneProfileCommand> {
    private readonly logger = new Logger(CloneProfileHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CloneProfileCommand) {
    try {
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
    } catch (error) {
      this.logger.error(`CloneProfileHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
