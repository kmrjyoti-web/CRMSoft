import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { RejectRawContactCommand } from './reject-raw-contact.command';
import {
  IRawContactRepository, RAW_CONTACT_REPOSITORY,
} from '../../../domain/interfaces/raw-contact-repository.interface';

@CommandHandler(RejectRawContactCommand)
export class RejectRawContactHandler implements ICommandHandler<RejectRawContactCommand> {
  private readonly logger = new Logger(RejectRawContactHandler.name);

  constructor(
    @Inject(RAW_CONTACT_REPOSITORY) private readonly repo: IRawContactRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: RejectRawContactCommand): Promise<void> {
    try {
      const rawContact = await this.repo.findById(command.rawContactId);
      if (!rawContact) throw new NotFoundException(`RawContact ${command.rawContactId} not found`);

      const withEvents = this.publisher.mergeObjectContext(rawContact);
      withEvents.reject(command.reason);

      await this.repo.save(withEvents);
      withEvents.commit();

      this.logger.log(`RawContact ${rawContact.id} rejected`);
    } catch (error) {
      this.logger.error(`RejectRawContactHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
