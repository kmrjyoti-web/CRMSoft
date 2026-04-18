import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { ReopenRawContactCommand } from './reopen-raw-contact.command';
import {
  IRawContactRepository, RAW_CONTACT_REPOSITORY,
} from '../../../domain/interfaces/raw-contact-repository.interface';

@CommandHandler(ReopenRawContactCommand)
export class ReopenRawContactHandler implements ICommandHandler<ReopenRawContactCommand> {
  private readonly logger = new Logger(ReopenRawContactHandler.name);

  constructor(
    @Inject(RAW_CONTACT_REPOSITORY) private readonly repo: IRawContactRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: ReopenRawContactCommand): Promise<void> {
    try {
      const rawContact = await this.repo.findById(command.rawContactId);
      if (!rawContact) throw new NotFoundException(`RawContact ${command.rawContactId} not found`);

      const withEvents = this.publisher.mergeObjectContext(rawContact);
      withEvents.reopen();

      await this.repo.save(withEvents);
      withEvents.commit();

      this.logger.log(`RawContact ${rawContact.id} reopened`);
    } catch (error) {
      this.logger.error(`ReopenRawContactHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
