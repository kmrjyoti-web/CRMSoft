import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { SoftDeleteOrganizationCommand } from './soft-delete-organization.command';
import {
  IOrganizationRepository, ORGANIZATION_REPOSITORY,
} from '../../../domain/interfaces/organization-repository.interface';

@CommandHandler(SoftDeleteOrganizationCommand)
export class SoftDeleteOrganizationHandler implements ICommandHandler<SoftDeleteOrganizationCommand> {
  private readonly logger = new Logger(SoftDeleteOrganizationHandler.name);

  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly repo: IOrganizationRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: SoftDeleteOrganizationCommand): Promise<void> {
    const org = await this.repo.findById(command.organizationId);
    if (!org) throw new NotFoundException(`Organization ${command.organizationId} not found`);

    const withEvents = this.publisher.mergeObjectContext(org);
    withEvents.softDelete(command.deletedById);

    await this.repo.save(withEvents);
    withEvents.commit();

    this.logger.log(`Organization ${org.id} soft-deleted by ${command.deletedById}`);
  }
}
