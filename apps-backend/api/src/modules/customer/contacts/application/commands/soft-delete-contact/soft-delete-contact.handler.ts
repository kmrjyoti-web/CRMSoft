import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { SoftDeleteContactCommand } from './soft-delete-contact.command';
import {
  IContactRepository, CONTACT_REPOSITORY,
} from '../../../domain/interfaces/contact-repository.interface';

@CommandHandler(SoftDeleteContactCommand)
export class SoftDeleteContactHandler implements ICommandHandler<SoftDeleteContactCommand> {
  private readonly logger = new Logger(SoftDeleteContactHandler.name);

  constructor(
    @Inject(CONTACT_REPOSITORY) private readonly repo: IContactRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: SoftDeleteContactCommand): Promise<void> {
    try {
      const contact = await this.repo.findById(command.contactId);
      if (!contact) throw new NotFoundException(`Contact ${command.contactId} not found`);

      const withEvents = this.publisher.mergeObjectContext(contact);
      withEvents.softDelete(command.deletedById);

      await this.repo.save(withEvents);
      withEvents.commit();

      this.logger.log(`Contact ${contact.id} soft-deleted by ${command.deletedById}`);
    } catch (error) {
      this.logger.error(`SoftDeleteContactHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
