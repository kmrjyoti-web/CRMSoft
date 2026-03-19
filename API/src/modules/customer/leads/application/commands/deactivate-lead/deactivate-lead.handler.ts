import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { DeactivateLeadCommand } from './deactivate-lead.command';
import {
  ILeadRepository, LEAD_REPOSITORY,
} from '../../../domain/interfaces/lead-repository.interface';

@CommandHandler(DeactivateLeadCommand)
export class DeactivateLeadHandler implements ICommandHandler<DeactivateLeadCommand> {
  private readonly logger = new Logger(DeactivateLeadHandler.name);

  constructor(
    @Inject(LEAD_REPOSITORY) private readonly repo: ILeadRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: DeactivateLeadCommand): Promise<void> {
    const lead = await this.repo.findById(command.leadId);
    if (!lead) throw new NotFoundException(`Lead ${command.leadId} not found`);

    const withEvents = this.publisher.mergeObjectContext(lead);
    withEvents.deactivate();

    await this.repo.save(withEvents);
    withEvents.commit();

    this.logger.log(`Lead ${lead.id} deactivated`);
  }
}
