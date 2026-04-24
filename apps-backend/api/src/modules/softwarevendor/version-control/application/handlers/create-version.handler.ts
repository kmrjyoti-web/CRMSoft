// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Logger } from '@nestjs/common';
import { CreateVersionCommand } from '../commands/create-version.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(CreateVersionCommand)
export class CreateVersionHandler implements ICommandHandler<CreateVersionCommand> {
  private readonly logger = new Logger(CreateVersionHandler.name);
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateVersionCommand) {
    try {
      const existing = await this.prisma.platform.appVersion.findUnique({
        where: { version: cmd.version },
      });
      if (existing) {
        throw new ConflictException(`Version ${cmd.version} already exists`);
      }

      return this.prisma.platform.appVersion.create({
        data: {
          version: cmd.version,
          releaseType: cmd.releaseType,
          status: 'DRAFT',
          changelog: cmd.changelog ?? [],
          breakingChanges: cmd.breakingChanges ?? [],
          migrationNotes: cmd.migrationNotes,
          codeName: cmd.codeName,
          gitBranch: cmd.gitBranch,
        },
      });
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`CreateVersionHandler failed: ${err.message}`, err.stack);
      throw error;
    }
  }
}
