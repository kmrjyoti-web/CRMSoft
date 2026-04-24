import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { ReactivateLeadCommand } from './reactivate-lead.command';
import {
  ILeadRepository, LEAD_REPOSITORY,
} from '../../../domain/interfaces/lead-repository.interface';

@CommandHandler(ReactivateLeadCommand)
export class ReactivateLeadHandler implements ICommandHandler<ReactivateLeadCommand> {
  private readonly logger = new Logger(ReactivateLeadHandler.name);

  constructor(
    @Inject(LEAD_REPOSITORY) private readonly repo: ILeadRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: ReactivateLeadCommand): Promise<void> {
    try {
      const lead = await this.repo.findById(command.leadId);
      if (!lead) throw new NotFoundException(`Lead ${command.leadId} not found`);

      const withEvents = this.publisher.mergeObjectContext(lead);
      withEvents.reactivate();

      await this.repo.save(withEvents);
      withEvents.commit();

      this.logger.log(`Lead ${lead.id} reactivated`);
    } catch (error) {
      this.logger.error(`ReactivateLeadHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
