import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PermanentDeleteRawContactCommand } from './permanent-delete-raw-contact.command';
import {
  IRawContactRepository, RAW_CONTACT_REPOSITORY,
} from '../../../domain/interfaces/raw-contact-repository.interface';

@CommandHandler(PermanentDeleteRawContactCommand)
export class PermanentDeleteRawContactHandler implements ICommandHandler<PermanentDeleteRawContactCommand> {
  private readonly logger = new Logger(PermanentDeleteRawContactHandler.name);

  constructor(
    @Inject(RAW_CONTACT_REPOSITORY) private readonly repo: IRawContactRepository,
  ) {}

  async execute(command: PermanentDeleteRawContactCommand): Promise<void> {
    const rawContact = await this.repo.findById(command.rawContactId);
    if (!rawContact) throw new NotFoundException(`RawContact ${command.rawContactId} not found`);

    if (!rawContact.isDeleted) {
      throw new BadRequestException(
        'RawContact must be soft-deleted before permanent deletion',
      );
    }

    await this.repo.delete(command.rawContactId);

    this.logger.log(`RawContact ${command.rawContactId} permanently deleted`);
  }
}
