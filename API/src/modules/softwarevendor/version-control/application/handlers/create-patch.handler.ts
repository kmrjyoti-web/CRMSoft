// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreatePatchCommand } from '../commands/create-patch.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(CreatePatchCommand)
export class CreatePatchHandler implements ICommandHandler<CreatePatchCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreatePatchCommand) {
    const version = await this.prisma.platform.appVersion.findUnique({
      where: { id: cmd.versionId },
    });
    if (!version) throw new NotFoundException(`Version ${cmd.versionId} not found`);

    const existing = await this.prisma.platform.industryPatch.findFirst({
      where: { versionId: cmd.versionId, industryCode: cmd.industryCode, patchName: cmd.patchName },
    });
    if (existing) {
      throw new ConflictException(`Patch ${cmd.patchName} already exists for this version and industry`);
    }

    return this.prisma.platform.industryPatch.create({
      data: {
        versionId: cmd.versionId,
        industryCode: cmd.industryCode,
        patchName: cmd.patchName,
        description: cmd.description,
        schemaChanges: cmd.schemaChanges ?? null,
        configOverrides: cmd.configOverrides ?? null,
        menuOverrides: cmd.menuOverrides ?? null,
        forceUpdate: cmd.forceUpdate ?? false,
        status: 'PENDING',
      },
    });
  }
}
