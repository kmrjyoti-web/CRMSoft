import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { ReactivateOrganizationCommand } from './reactivate-organization.command';
import {
  IOrganizationRepository, ORGANIZATION_REPOSITORY,
} from '../../../domain/interfaces/organization-repository.interface';

@CommandHandler(ReactivateOrganizationCommand)
export class ReactivateOrganizationHandler implements ICommandHandler<ReactivateOrganizationCommand> {
  private readonly logger = new Logger(ReactivateOrganizationHandler.name);

  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly repo: IOrganizationRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: ReactivateOrganizationCommand): Promise<void> {
    try {
      const org = await this.repo.findById(command.organizationId);
      if (!org) throw new NotFoundException(`Organization ${command.organizationId} not found`);

      const withEvents = this.publisher.mergeObjectContext(org);
      withEvents.reactivate();

      await this.repo.save(withEvents);
      withEvents.commit();

      this.logger.log(`Organization ${org.id} reactivated`);
    } catch (error) {
      this.logger.error(`ReactivateOrganizationHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
