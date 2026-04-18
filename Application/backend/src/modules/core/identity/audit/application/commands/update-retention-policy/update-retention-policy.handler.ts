import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UpdateRetentionPolicyCommand } from './update-retention-policy.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateRetentionPolicyCommand)
export class UpdateRetentionPolicyHandler implements ICommandHandler<UpdateRetentionPolicyCommand> {
    private readonly logger = new Logger(UpdateRetentionPolicyHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateRetentionPolicyCommand) {
    try {
      const existing = await this.prisma.identity.auditRetentionPolicy.findFirst({
        where: { entityType: command.entityType as any },
      });

      if (existing) {
        return this.prisma.identity.auditRetentionPolicy.update({
          where: { id: existing.id },
          data: {
            retentionDays: command.retentionDays,
            ...(command.archiveEnabled !== undefined && { archiveEnabled: command.archiveEnabled }),
            ...(command.isActive !== undefined && { isActive: command.isActive }),
          },
        });
      } else {
        return this.prisma.identity.auditRetentionPolicy.create({
          data: {
            entityType: command.entityType as any,
            retentionDays: command.retentionDays,
            archiveEnabled: command.archiveEnabled ?? false,
            isActive: command.isActive ?? true,
          },
        });
      }
    } catch (error) {
      this.logger.error(`UpdateRetentionPolicyHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
