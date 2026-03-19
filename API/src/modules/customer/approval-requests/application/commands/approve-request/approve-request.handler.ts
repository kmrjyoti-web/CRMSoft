import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { ApproveRequestCommand } from './approve-request.command';
import { MakerCheckerEngine } from '../../../../../../core/permissions/engines/maker-checker.engine';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(ApproveRequestCommand)
export class ApproveRequestHandler implements ICommandHandler<ApproveRequestCommand> {
  constructor(
    private readonly makerChecker: MakerCheckerEngine,
    private readonly prisma: PrismaService,
  ) {}

  async execute(cmd: ApproveRequestCommand) {
    // Validate checker has the right role
    const request = await this.prisma.approvalRequest.findUnique({
      where: { id: cmd.requestId },
    });
    if (request && request.checkerRole !== cmd.checkerRole) {
      throw new ForbiddenException(
        `This request requires role "${request.checkerRole}" to approve`,
      );
    }

    return this.makerChecker.approve(cmd.requestId, cmd.checkerId, cmd.note);
  }
}
