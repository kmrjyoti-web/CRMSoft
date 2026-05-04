import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { SaveProfileCommand } from './save-profile.command';

@CommandHandler(SaveProfileCommand)
export class SaveProfileHandler implements ICommandHandler<SaveProfileCommand> {
    private readonly logger = new Logger(SaveProfileHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: SaveProfileCommand) {
    try {
      const job = await this.prisma.working.importJob.findUniqueOrThrow({ where: { id: cmd.jobId } });

      const profile = await this.prisma.working.importProfile.create({
        data: {
          name: cmd.name,
          description: cmd.description,
          sourceSystem: cmd.sourceSystem,
          targetEntity: job.targetEntity,
          expectedHeaders: job.fileHeaders,
          fieldMapping: job.fieldMapping || [],
          defaultValues: job.defaultValues || undefined,
          validationRules: job.validationRules || undefined,
          duplicateCheckFields: job.duplicateCheckFields,
          duplicateStrategy: job.duplicateStrategy,
          fuzzyMatchEnabled: job.fuzzyMatchEnabled,
          fuzzyMatchFields: job.fuzzyMatchFields,
          fuzzyThreshold: job.fuzzyThreshold,
          createdById: job.createdById,
          createdByName: job.createdByName,
        },
      });

      // Link the job to the new profile
      await this.prisma.working.importJob.update({
        where: { id: cmd.jobId },
        data: { profileId: profile.id },
      });

      return profile;
    } catch (error) {
      this.logger.error(`SaveProfileHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
