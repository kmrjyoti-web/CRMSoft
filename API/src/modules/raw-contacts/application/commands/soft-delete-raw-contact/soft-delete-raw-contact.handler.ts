import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { SoftDeleteRawContactCommand } from './soft-delete-raw-contact.command';
import {
  IRawContactRepository, RAW_CONTACT_REPOSITORY,
} from '../../../domain/interfaces/raw-contact-repository.interface';

@CommandHandler(SoftDeleteRawContactCommand)
export class SoftDeleteRawContactHandler implements ICommandHandler<SoftDeleteRawContactCommand> {
  private readonly logger = new Logger(SoftDeleteRawContactHandler.name);

  constructor(
    @Inject(RAW_CONTACT_REPOSITORY) private readonly repo: IRawContactRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: SoftDeleteRawContactCommand): Promise<void> {
    const rawContact = await this.repo.findById(command.rawContactId);
    if (!rawContact) throw new NotFoundException(`RawContact ${command.rawContactId} not found`);

    const withEvents = this.publisher.mergeObjectContext(rawContact);
    withEvents.softDelete(command.deletedById);

    await this.repo.save(withEvents);
    withEvents.commit();

    this.logger.log(`RawContact ${rawContact.id} soft-deleted by ${command.deletedById}`);
  }
}
