import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { ReactivateContactCommand } from './reactivate-contact.command';
import {
  IContactRepository, CONTACT_REPOSITORY,
} from '../../../domain/interfaces/contact-repository.interface';

@CommandHandler(ReactivateContactCommand)
export class ReactivateContactHandler implements ICommandHandler<ReactivateContactCommand> {
  private readonly logger = new Logger(ReactivateContactHandler.name);

  constructor(
    @Inject(CONTACT_REPOSITORY) private readonly repo: IContactRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: ReactivateContactCommand): Promise<void> {
    const contact = await this.repo.findById(command.contactId);
    if (!contact) throw new NotFoundException(`Contact ${command.contactId} not found`);

    const withEvents = this.publisher.mergeObjectContext(contact);
    withEvents.reactivate();

    await this.repo.save(withEvents);
    withEvents.commit();

    this.logger.log(`Contact ${contact.id} reactivated`);
  }
}
