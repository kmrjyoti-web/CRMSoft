import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { RestoreContactCommand } from './restore-contact.command';
import {
  IContactRepository, CONTACT_REPOSITORY,
} from '../../../domain/interfaces/contact-repository.interface';

@CommandHandler(RestoreContactCommand)
export class RestoreContactHandler implements ICommandHandler<RestoreContactCommand> {
  private readonly logger = new Logger(RestoreContactHandler.name);

  constructor(
    @Inject(CONTACT_REPOSITORY) private readonly repo: IContactRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: RestoreContactCommand): Promise<void> {
    try {
      const contact = await this.repo.findById(command.contactId);
      if (!contact) throw new NotFoundException(`Contact ${command.contactId} not found`);

      const withEvents = this.publisher.mergeObjectContext(contact);
      withEvents.restore();

      await this.repo.save(withEvents);
      withEvents.commit();

      this.logger.log(`Contact ${contact.id} restored`);
    } catch (error) {
      this.logger.error(`RestoreContactHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
