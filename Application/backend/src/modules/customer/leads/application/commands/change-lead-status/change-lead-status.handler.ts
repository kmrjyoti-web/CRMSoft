import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { ChangeLeadStatusCommand } from './change-lead-status.command';
import {
  ILeadRepository, LEAD_REPOSITORY,
} from '../../../domain/interfaces/lead-repository.interface';

/**
 * Change Lead status with full state machine validation.
 * Domain entity enforces valid transitions and requires reason for LOST.
 */
@CommandHandler(ChangeLeadStatusCommand)
export class ChangeLeadStatusHandler implements ICommandHandler<ChangeLeadStatusCommand> {
  private readonly logger = new Logger(ChangeLeadStatusHandler.name);

  constructor(
    @Inject(LEAD_REPOSITORY) private readonly repo: ILeadRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: ChangeLeadStatusCommand): Promise<void> {
    const lead = await this.repo.findById(command.leadId);
    if (!lead) throw new NotFoundException(`Lead ${command.leadId} not found`);

    const withEvents = this.publisher.mergeObjectContext(lead);
    withEvents.changeStatus(command.newStatus, command.reason);

    await this.repo.save(withEvents);
    withEvents.commit();

    this.logger.log(
      `Lead ${lead.leadNumber}: ${lead.status.value} → ${command.newStatus}`,
    );
  }
}
