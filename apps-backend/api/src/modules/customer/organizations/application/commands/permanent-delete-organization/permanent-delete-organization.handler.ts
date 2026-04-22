import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PermanentDeleteOrganizationCommand } from './permanent-delete-organization.command';
import {
  IOrganizationRepository, ORGANIZATION_REPOSITORY,
} from '../../../domain/interfaces/organization-repository.interface';

@CommandHandler(PermanentDeleteOrganizationCommand)
export class PermanentDeleteOrganizationHandler implements ICommandHandler<PermanentDeleteOrganizationCommand> {
  private readonly logger = new Logger(PermanentDeleteOrganizationHandler.name);

  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly repo: IOrganizationRepository,
  ) {}

  async execute(command: PermanentDeleteOrganizationCommand): Promise<void> {
    try {
      const org = await this.repo.findById(command.organizationId);
      if (!org) throw new NotFoundException(`Organization ${command.organizationId} not found`);

      if (!org.isDeleted) {
        throw new BadRequestException(
          'Organization must be soft-deleted before permanent deletion',
        );
      }

      await this.repo.delete(command.organizationId);

      this.logger.log(`Organization ${command.organizationId} permanently deleted`);
    } catch (error) {
      this.logger.error(`PermanentDeleteOrganizationHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
