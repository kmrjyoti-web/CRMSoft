// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { RollbackVersionCommand } from '../commands/rollback-version.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(RollbackVersionCommand)
export class RollbackVersionHandler implements ICommandHandler<RollbackVersionCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: RollbackVersionCommand) {
    const version = await this.prisma.platform.appVersion.findUnique({
      where: { id: cmd.versionId },
    });
    if (!version) throw new NotFoundException(`Version ${cmd.versionId} not found`);

    // 1. Save pre-rollback safety backup
    await this.prisma.identity.versionBackup.create({
      data: {
        versionId: cmd.versionId,
        backupType: 'MANUAL',
        status: 'COMPLETED',
        configSnapshot: {
          type: 'pre-rollback',
          rolledBackBy: cmd.rolledBackBy,
          reason: cmd.rollbackReason,
          at: new Date(),
        },
      },
    });

    // 2. Deprecate current LIVE version
    await this.prisma.platform.appVersion.updateMany({
      where: { status: 'LIVE' },
      data: { status: 'DEPRECATED' },
    });

    // 3. Restore target version to LIVE
    return this.prisma.platform.appVersion.update({
      where: { id: cmd.versionId },
      data: {
        status: 'LIVE',
        rollbackAt: new Date(),
        rollbackReason: cmd.rollbackReason,
        deployedAt: new Date(),
        deployedBy: cmd.rolledBackBy,
      },
    });
  }
}
