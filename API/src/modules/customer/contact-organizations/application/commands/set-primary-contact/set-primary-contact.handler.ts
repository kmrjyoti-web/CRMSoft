import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { SetPrimaryContactCommand } from './set-primary-contact.command';
import {
  IContactOrgRepository, CONTACT_ORG_REPOSITORY,
} from '../../../domain/interfaces/contact-org-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

/**
 * Set a contact as the primary contact for an organization.
 * Unsets any existing primary for the same organization.
 */
@CommandHandler(SetPrimaryContactCommand)
export class SetPrimaryContactHandler implements ICommandHandler<SetPrimaryContactCommand> {
  private readonly logger = new Logger(SetPrimaryContactHandler.name);

  constructor(
    @Inject(CONTACT_ORG_REPOSITORY) private readonly repo: IContactOrgRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: SetPrimaryContactCommand): Promise<void> {
    const mapping = await this.repo.findById(command.mappingId);
    if (!mapping) throw new NotFoundException(`Mapping ${command.mappingId} not found`);
    if (!mapping.isActive) throw new Error('Cannot set primary on deactivated mapping');
    if (mapping.isPrimary) return; // Already primary

    // Unset existing primary for same org
    await this.prisma.contactOrganization.updateMany({
      where: { organizationId: mapping.organizationId, isPrimary: true },
      data: { isPrimary: false },
    });

    // Set this one as primary
    await this.prisma.contactOrganization.update({
      where: { id: command.mappingId },
      data: { isPrimary: true },
    });

    this.logger.log(
      `Contact ${mapping.contactId} set as primary for Org ${mapping.organizationId}`,
    );
  }
}
