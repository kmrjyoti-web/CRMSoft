import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RevertDelegationCommand } from './revert-delegation.command';
import { DelegationService } from '../../../services/delegation.service';

@CommandHandler(RevertDelegationCommand)
export class RevertDelegationHandler implements ICommandHandler<RevertDelegationCommand> {
  constructor(private readonly delegation: DelegationService) {}

  async execute(command: RevertDelegationCommand) {
    return this.delegation.revertDelegation(command.delegationId, command.revertedById);
  }
}
