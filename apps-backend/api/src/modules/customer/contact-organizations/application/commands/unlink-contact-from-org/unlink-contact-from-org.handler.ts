import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { UnlinkContactFromOrgCommand } from './unlink-contact-from-org.command';
import {
  IContactOrgRepository, CONTACT_ORG_REPOSITORY,
} from '../../../domain/interfaces/contact-org-repository.interface';

/**
 * Unlink = deactivate (soft delete). Sets endDate + isActive=false.
 */
@CommandHandler(UnlinkContactFromOrgCommand)
export class UnlinkContactFromOrgHandler implements ICommandHandler<UnlinkContactFromOrgCommand> {
  private readonly logger = new Logger(UnlinkContactFromOrgHandler.name);

  constructor(
    @Inject(CONTACT_ORG_REPOSITORY) private readonly repo: IContactOrgRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: UnlinkContactFromOrgCommand): Promise<void> {
    try {
      const mapping = await this.repo.findById(command.mappingId);
      if (!mapping) throw new NotFoundException(`Mapping ${command.mappingId} not found`);

      if (!mapping.isActive) {
        throw new Error('Mapping is already deactivated');
      }

      const withEvents = this.publisher.mergeObjectContext(mapping);
      withEvents.deactivate();

      await this.repo.save(withEvents);
      withEvents.commit();

      this.logger.log(
        `Unlinked: Contact ${mapping.contactId} from Org ${mapping.organizationId}`,
      );
    } catch (error) {
      this.logger.error(`UnlinkContactFromOrgHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
