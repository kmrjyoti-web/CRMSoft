import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { DeactivateContactCommand } from './deactivate-contact.command';
import {
  IContactRepository, CONTACT_REPOSITORY,
} from '../../../domain/interfaces/contact-repository.interface';

@CommandHandler(DeactivateContactCommand)
export class DeactivateContactHandler implements ICommandHandler<DeactivateContactCommand> {
  private readonly logger = new Logger(DeactivateContactHandler.name);

  constructor(
    @Inject(CONTACT_REPOSITORY) private readonly repo: IContactRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: DeactivateContactCommand): Promise<void> {
    try {
      const contact = await this.repo.findById(command.contactId);
      if (!contact) throw new NotFoundException(`Contact ${command.contactId} not found`);

      const withEvents = this.publisher.mergeObjectContext(contact);
      withEvents.deactivate();

      await this.repo.save(withEvents);
      withEvents.commit();

      this.logger.log(`Contact ${contact.id} deactivated`);
    } catch (error) {
      this.logger.error(`DeactivateContactHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
