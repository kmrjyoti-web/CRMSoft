import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { MarkDuplicateCommand } from './mark-duplicate.command';
import {
  IRawContactRepository, RAW_CONTACT_REPOSITORY,
} from '../../../domain/interfaces/raw-contact-repository.interface';

@CommandHandler(MarkDuplicateCommand)
export class MarkDuplicateHandler implements ICommandHandler<MarkDuplicateCommand> {
  private readonly logger = new Logger(MarkDuplicateHandler.name);

  constructor(
    @Inject(RAW_CONTACT_REPOSITORY) private readonly repo: IRawContactRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: MarkDuplicateCommand): Promise<void> {
    try {
      const rawContact = await this.repo.findById(command.rawContactId);
      if (!rawContact) throw new NotFoundException(`RawContact ${command.rawContactId} not found`);

      const withEvents = this.publisher.mergeObjectContext(rawContact);
      withEvents.markDuplicate();

      await this.repo.save(withEvents);
      withEvents.commit();

      this.logger.log(`RawContact ${rawContact.id} marked duplicate`);
    } catch (error) {
      this.logger.error(`MarkDuplicateHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
