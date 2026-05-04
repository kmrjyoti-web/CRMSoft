import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { UpdateOrganizationCommand } from './update-organization.command';
import {
  IOrganizationRepository, ORGANIZATION_REPOSITORY,
} from '../../../domain/interfaces/organization-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateOrganizationCommand)
export class UpdateOrganizationHandler implements ICommandHandler<UpdateOrganizationCommand> {
  private readonly logger = new Logger(UpdateOrganizationHandler.name);

  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly repo: IOrganizationRepository,
    private readonly publisher: EventPublisher,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: UpdateOrganizationCommand): Promise<void> {
    try {
      const org = await this.repo.findById(command.organizationId);
      if (!org) throw new NotFoundException(`Organization ${command.organizationId} not found`);

      const withEvents = this.publisher.mergeObjectContext(org);
      withEvents.updateDetails(command.data);

      await this.repo.save(withEvents);

      // Update filters (replace strategy: delete all, re-create)
      if (command.filterIds !== undefined) {
        await this.prisma.working.organizationFilter.deleteMany({
          where: { organizationId: org.id },
        });
        if (command.filterIds.length) {
          await this.prisma.working.organizationFilter.createMany({
            data: command.filterIds.map(fid => ({
              organizationId: org.id,
              lookupValueId: fid,
            })),
            skipDuplicates: true,
          });
        }
      }

      withEvents.commit();
      this.logger.log(`Organization ${org.id} updated`);
    } catch (error) {
      this.logger.error(`UpdateOrganizationHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
