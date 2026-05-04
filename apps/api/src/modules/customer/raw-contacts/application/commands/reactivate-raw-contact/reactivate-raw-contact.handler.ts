import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { ReactivateRawContactCommand } from './reactivate-raw-contact.command';
import {
  IRawContactRepository, RAW_CONTACT_REPOSITORY,
} from '../../../domain/interfaces/raw-contact-repository.interface';

@CommandHandler(ReactivateRawContactCommand)
export class ReactivateRawContactHandler implements ICommandHandler<ReactivateRawContactCommand> {
  private readonly logger = new Logger(ReactivateRawContactHandler.name);

  constructor(
    @Inject(RAW_CONTACT_REPOSITORY) private readonly repo: IRawContactRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: ReactivateRawContactCommand): Promise<void> {
    try {
      const rawContact = await this.repo.findById(command.rawContactId);
      if (!rawContact) throw new NotFoundException(`RawContact ${command.rawContactId} not found`);

      const withEvents = this.publisher.mergeObjectContext(rawContact);
      withEvents.reactivate();

      await this.repo.save(withEvents);
      withEvents.commit();

      this.logger.log(`RawContact ${rawContact.id} reactivated`);
    } catch (error) {
      this.logger.error(`ReactivateRawContactHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
