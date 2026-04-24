import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { DeactivateRawContactCommand } from './deactivate-raw-contact.command';
import {
  IRawContactRepository, RAW_CONTACT_REPOSITORY,
} from '../../../domain/interfaces/raw-contact-repository.interface';

@CommandHandler(DeactivateRawContactCommand)
export class DeactivateRawContactHandler implements ICommandHandler<DeactivateRawContactCommand> {
  private readonly logger = new Logger(DeactivateRawContactHandler.name);

  constructor(
    @Inject(RAW_CONTACT_REPOSITORY) private readonly repo: IRawContactRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: DeactivateRawContactCommand): Promise<void> {
    try {
      const rawContact = await this.repo.findById(command.rawContactId);
      if (!rawContact) throw new NotFoundException(`RawContact ${command.rawContactId} not found`);

      const withEvents = this.publisher.mergeObjectContext(rawContact);
      withEvents.deactivate();

      await this.repo.save(withEvents);
      withEvents.commit();

      this.logger.log(`RawContact ${rawContact.id} deactivated`);
    } catch (error) {
      this.logger.error(`DeactivateRawContactHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
