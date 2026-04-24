import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { DeactivateOrganizationCommand } from './deactivate-organization.command';
import {
  IOrganizationRepository, ORGANIZATION_REPOSITORY,
} from '../../../domain/interfaces/organization-repository.interface';

@CommandHandler(DeactivateOrganizationCommand)
export class DeactivateOrganizationHandler implements ICommandHandler<DeactivateOrganizationCommand> {
  private readonly logger = new Logger(DeactivateOrganizationHandler.name);

  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly repo: IOrganizationRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: DeactivateOrganizationCommand): Promise<void> {
    try {
      const org = await this.repo.findById(command.organizationId);
      if (!org) throw new NotFoundException(`Organization ${command.organizationId} not found`);

      const withEvents = this.publisher.mergeObjectContext(org);
      withEvents.deactivate();

      await this.repo.save(withEvents);
      withEvents.commit();

      this.logger.log(`Organization ${org.id} deactivated`);
    } catch (error) {
      this.logger.error(`DeactivateOrganizationHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
