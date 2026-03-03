import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SetUserAvailabilityCommand } from './set-user-availability.command';
import { WorkloadService } from '../../../services/workload.service';
import { DelegationService } from '../../../services/delegation.service';

@CommandHandler(SetUserAvailabilityCommand)
export class SetUserAvailabilityHandler implements ICommandHandler<SetUserAvailabilityCommand> {
  constructor(
    private readonly workload: WorkloadService,
    private readonly delegation: DelegationService,
  ) {}

  async execute(command: SetUserAvailabilityCommand) {
    const result = await this.workload.setAvailability({
      userId: command.userId, isAvailable: command.isAvailable,
      unavailableFrom: command.unavailableFrom, unavailableTo: command.unavailableTo,
      delegateToId: command.delegateToId,
    });

    // If going unavailable with a delegate, auto-create delegation
    if (!command.isAvailable && command.delegateToId && command.unavailableFrom && command.unavailableTo) {
      await this.delegation.delegate({
        fromUserId: command.userId, toUserId: command.delegateToId,
        startDate: command.unavailableFrom, endDate: command.unavailableTo,
        reason: command.reason || 'On leave', delegatedById: command.performedById || command.userId,
      });
    }

    return result;
  }
}
