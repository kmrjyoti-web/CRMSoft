import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RevertDelegationCommand } from './revert-delegation.command';
import { DelegationService } from '../../../services/delegation.service';

@CommandHandler(RevertDelegationCommand)
export class RevertDelegationHandler implements ICommandHandler<RevertDelegationCommand> {
    private readonly logger = new Logger(RevertDelegationHandler.name);

  constructor(private readonly delegation: DelegationService) {}

  async execute(command: RevertDelegationCommand) {
    try {
      return this.delegation.revertDelegation(command.delegationId, command.revertedById);
    } catch (error) {
      this.logger.error(`RevertDelegationHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
