import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Logger } from '@nestjs/common';
import { ApproveRequestCommand } from './approve-request.command';
import { MakerCheckerEngine } from '../../../../../../core/permissions/engines/maker-checker.engine';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CrossService } from '../../../../../../common/decorators/cross-service.decorator';

@CrossService('identity', 'Uses MakerCheckerEngine from core/permissions to validate and record the checker approval decision')
@CommandHandler(ApproveRequestCommand)
export class ApproveRequestHandler implements ICommandHandler<ApproveRequestCommand> {
    private readonly logger = new Logger(ApproveRequestHandler.name);

  constructor(
    private readonly makerChecker: MakerCheckerEngine,
    private readonly prisma: PrismaService,
  ) {}

  async execute(cmd: ApproveRequestCommand) {
    try {
      // Validate checker has the right role
      const request = await this.prisma.working.approvalRequest.findUnique({
        where: { id: cmd.requestId },
      });
      if (request && request.checkerRole !== cmd.checkerRole) {
        throw new ForbiddenException(
          `This request requires role "${request.checkerRole}" to approve`,
        );
      }

      return this.makerChecker.approve(cmd.requestId, cmd.checkerId, cmd.note);
    } catch (error) {
      this.logger.error(`ApproveRequestHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
