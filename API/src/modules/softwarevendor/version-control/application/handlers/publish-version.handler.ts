// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PublishVersionCommand } from '../commands/publish-version.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(PublishVersionCommand)
export class PublishVersionHandler implements ICommandHandler<PublishVersionCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: PublishVersionCommand) {
    const version = await this.prisma.platform.appVersion.findUnique({
      where: { id: cmd.versionId },
    });
    if (!version) throw new NotFoundException(`Version ${cmd.versionId} not found`);
    if (version.status === 'LIVE') {
      throw new BadRequestException('Version is already LIVE');
    }

    // 1. Create backup record (before going live)
    await this.prisma.identity.versionBackup.create({
      data: {
        versionId: cmd.versionId,
        backupType: 'PRE_DEPLOY',
        status: 'COMPLETED',
        gitTag: cmd.gitTag ?? `v${version.version}`,
        configSnapshot: { publishedBy: cmd.publishedBy, publishedAt: new Date() },
      },
    });

    // 2. Deprecate previous LIVE version
    await this.prisma.platform.appVersion.updateMany({
      where: { status: 'LIVE' },
      data: { status: 'DEPRECATED' },
    });

    // 3. Mark this version as LIVE
    return this.prisma.platform.appVersion.update({
      where: { id: cmd.versionId },
      data: {
        status: 'LIVE',
        deployedAt: new Date(),
        deployedBy: cmd.publishedBy,
        gitTag: cmd.gitTag,
        gitCommitHash: cmd.gitCommitHash,
      },
    });
  }
}
