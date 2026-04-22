import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { RestoreRawContactCommand } from './restore-raw-contact.command';
import {
  IRawContactRepository, RAW_CONTACT_REPOSITORY,
} from '../../../domain/interfaces/raw-contact-repository.interface';

@CommandHandler(RestoreRawContactCommand)
export class RestoreRawContactHandler implements ICommandHandler<RestoreRawContactCommand> {
  private readonly logger = new Logger(RestoreRawContactHandler.name);

  constructor(
    @Inject(RAW_CONTACT_REPOSITORY) private readonly repo: IRawContactRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: RestoreRawContactCommand): Promise<void> {
    try {
      const rawContact = await this.repo.findById(command.rawContactId);
      if (!rawContact) throw new NotFoundException(`RawContact ${command.rawContactId} not found`);

      const withEvents = this.publisher.mergeObjectContext(rawContact);
      withEvents.restore();

      await this.repo.save(withEvents);
      withEvents.commit();

      this.logger.log(`RawContact ${rawContact.id} restored`);
    } catch (error) {
      this.logger.error(`RestoreRawContactHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
