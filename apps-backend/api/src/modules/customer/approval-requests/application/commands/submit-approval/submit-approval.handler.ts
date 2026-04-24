import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SubmitApprovalCommand } from './submit-approval.command';
import { MakerCheckerEngine } from '../../../../../../core/permissions/engines/maker-checker.engine';
import { CrossService } from '../../../../../../common/decorators/cross-service.decorator';

@CrossService('identity', 'Uses MakerCheckerEngine from core/permissions to validate and record maker-checker decisions')
@CommandHandler(SubmitApprovalCommand)
export class SubmitApprovalHandler implements ICommandHandler<SubmitApprovalCommand> {
    private readonly logger = new Logger(SubmitApprovalHandler.name);

  constructor(private readonly makerChecker: MakerCheckerEngine) {}

  async execute(cmd: SubmitApprovalCommand) {
    try {
      return this.makerChecker.submit(
        {
          userId: cmd.makerId,
          roleId: '',
          roleName: cmd.roleName,
          roleLevel: cmd.roleLevel,
          action: cmd.action,
          resourceType: cmd.entityType,
          resourceId: cmd.entityId,
          attributes: cmd.payload,
        },
        cmd.makerNote,
      );
    } catch (error) {
      this.logger.error(`SubmitApprovalHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
