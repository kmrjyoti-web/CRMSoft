import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateRetentionPolicyCommand } from './update-retention-policy.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateRetentionPolicyCommand)
export class UpdateRetentionPolicyHandler implements ICommandHandler<UpdateRetentionPolicyCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateRetentionPolicyCommand) {
    const existing = await this.prisma.auditRetentionPolicy.findFirst({
      where: { entityType: command.entityType as any },
    });

    if (existing) {
      return this.prisma.auditRetentionPolicy.update({
        where: { id: existing.id },
        data: {
          retentionDays: command.retentionDays,
          ...(command.archiveEnabled !== undefined && { archiveEnabled: command.archiveEnabled }),
          ...(command.isActive !== undefined && { isActive: command.isActive }),
        },
      });
    } else {
      return this.prisma.auditRetentionPolicy.create({
        data: {
          entityType: command.entityType as any,
          retentionDays: command.retentionDays,
          archiveEnabled: command.archiveEnabled ?? false,
          isActive: command.isActive ?? true,
        },
      });
    }
  }
}
