import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CreateProfileCommand } from './create-profile.command';

@CommandHandler(CreateProfileCommand)
export class CreateProfileHandler implements ICommandHandler<CreateProfileCommand> {
    private readonly logger = new Logger(CreateProfileHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateProfileCommand) {
    try {
      return this.prisma.working.importProfile.create({
        data: {
          name: cmd.name,
          description: cmd.description,
          sourceSystem: cmd.sourceSystem,
          icon: cmd.icon,
          color: cmd.color,
          targetEntity: cmd.targetEntity as any,
          expectedHeaders: cmd.expectedHeaders,
          fieldMapping: cmd.fieldMapping as any,
          defaultValues: cmd.defaultValues || undefined as any,
          validationRules: cmd.validationRules || undefined as any,
          duplicateCheckFields: cmd.duplicateCheckFields || [],
          duplicateStrategy: (cmd.duplicateStrategy as any) || 'ASK_PER_ROW',
          fuzzyMatchEnabled: cmd.fuzzyMatchEnabled || false,
          fuzzyMatchFields: cmd.fuzzyMatchFields || [],
          fuzzyThreshold: cmd.fuzzyThreshold || 0.85,
          createdById: cmd.createdById,
          createdByName: cmd.createdByName,
        },
      });
    } catch (error) {
      this.logger.error(`CreateProfileHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
