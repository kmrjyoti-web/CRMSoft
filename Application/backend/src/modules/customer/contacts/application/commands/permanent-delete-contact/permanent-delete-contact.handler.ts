import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PermanentDeleteContactCommand } from './permanent-delete-contact.command';
import {
  IContactRepository, CONTACT_REPOSITORY,
} from '../../../domain/interfaces/contact-repository.interface';

@CommandHandler(PermanentDeleteContactCommand)
export class PermanentDeleteContactHandler implements ICommandHandler<PermanentDeleteContactCommand> {
  private readonly logger = new Logger(PermanentDeleteContactHandler.name);

  constructor(
    @Inject(CONTACT_REPOSITORY) private readonly repo: IContactRepository,
  ) {}

  async execute(command: PermanentDeleteContactCommand): Promise<void> {
    const contact = await this.repo.findById(command.contactId);
    if (!contact) throw new NotFoundException(`Contact ${command.contactId} not found`);

    if (!contact.isDeleted) {
      throw new BadRequestException(
        'Contact must be soft-deleted before permanent deletion',
      );
    }

    await this.repo.delete(command.contactId);

    this.logger.log(`Contact ${command.contactId} permanently deleted`);
  }
}
