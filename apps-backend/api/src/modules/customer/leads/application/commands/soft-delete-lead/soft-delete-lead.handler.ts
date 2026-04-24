import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { SoftDeleteLeadCommand } from './soft-delete-lead.command';
import {
  ILeadRepository, LEAD_REPOSITORY,
} from '../../../domain/interfaces/lead-repository.interface';

@CommandHandler(SoftDeleteLeadCommand)
export class SoftDeleteLeadHandler implements ICommandHandler<SoftDeleteLeadCommand> {
  private readonly logger = new Logger(SoftDeleteLeadHandler.name);

  constructor(
    @Inject(LEAD_REPOSITORY) private readonly repo: ILeadRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: SoftDeleteLeadCommand): Promise<void> {
    try {
      const lead = await this.repo.findById(command.leadId);
      if (!lead) throw new NotFoundException(`Lead ${command.leadId} not found`);

      const withEvents = this.publisher.mergeObjectContext(lead);
      withEvents.softDelete(command.deletedById);

      await this.repo.save(withEvents);
      withEvents.commit();

      this.logger.log(`Lead ${lead.id} soft-deleted by ${command.deletedById}`);
    } catch (error) {
      this.logger.error(`SoftDeleteLeadHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
