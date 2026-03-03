import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { UpdateRawContactCommand } from './update-raw-contact.command';
import {
  IRawContactRepository, RAW_CONTACT_REPOSITORY,
} from '../../../domain/interfaces/raw-contact-repository.interface';

@CommandHandler(UpdateRawContactCommand)
export class UpdateRawContactHandler implements ICommandHandler<UpdateRawContactCommand> {
  private readonly logger = new Logger(UpdateRawContactHandler.name);

  constructor(
    @Inject(RAW_CONTACT_REPOSITORY) private readonly repo: IRawContactRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: UpdateRawContactCommand): Promise<void> {
    const rawContact = await this.repo.findById(command.rawContactId);
    if (!rawContact) throw new NotFoundException(`RawContact ${command.rawContactId} not found`);

    const withEvents = this.publisher.mergeObjectContext(rawContact);
    withEvents.updateDetails(command.data);

    await this.repo.save(withEvents);
    withEvents.commit();

    this.logger.log(`RawContact ${rawContact.id} updated`);
  }
}
