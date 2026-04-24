import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { RestoreLeadCommand } from './restore-lead.command';
import {
  ILeadRepository, LEAD_REPOSITORY,
} from '../../../domain/interfaces/lead-repository.interface';

@CommandHandler(RestoreLeadCommand)
export class RestoreLeadHandler implements ICommandHandler<RestoreLeadCommand> {
  private readonly logger = new Logger(RestoreLeadHandler.name);

  constructor(
    @Inject(LEAD_REPOSITORY) private readonly repo: ILeadRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: RestoreLeadCommand): Promise<void> {
    try {
      const lead = await this.repo.findById(command.leadId);
      if (!lead) throw new NotFoundException(`Lead ${command.leadId} not found`);

      const withEvents = this.publisher.mergeObjectContext(lead);
      withEvents.restore();

      await this.repo.save(withEvents);
      withEvents.commit();

      this.logger.log(`Lead ${lead.id} restored`);
    } catch (error) {
      this.logger.error(`RestoreLeadHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
