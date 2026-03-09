import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, ConflictException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateOrganizationCommand } from './create-organization.command';
import { OrganizationEntity } from '../../../domain/entities/organization.entity';
import {
  IOrganizationRepository, ORGANIZATION_REPOSITORY,
} from '../../../domain/interfaces/organization-repository.interface';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(CreateOrganizationCommand)
export class CreateOrganizationHandler implements ICommandHandler<CreateOrganizationCommand> {
  private readonly logger = new Logger(CreateOrganizationHandler.name);

  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly repo: IOrganizationRepository,
    private readonly publisher: EventPublisher,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: CreateOrganizationCommand): Promise<string> {
    // 1. Check for duplicate name
    const existing = await this.repo.findByName(command.name.trim());
    if (existing) {
      throw new ConflictException(`Organization "${command.name}" already exists`);
    }

    // 2. Create domain entity (validates business rules)
    const org = OrganizationEntity.create(randomUUID(), {
      name: command.name,
      website: command.website,
      email: command.email,
      phone: command.phone,
      gstNumber: command.gstNumber,
      address: command.address,
      city: command.city,
      state: command.state,
      country: command.country,
      pincode: command.pincode,
      industry: command.industry,
      annualRevenue: command.annualRevenue,
      notes: command.notes,
      createdById: command.createdById,
    });

    // 3. Merge with event publisher
    const withEvents = this.publisher.mergeObjectContext(org);

    // 4. Persist
    await this.repo.save(withEvents);

    // 5. Create filter associations
    if (command.filterIds?.length) {
      await this.prisma.organizationFilter.createMany({
        data: command.filterIds.map(fid => ({
          organizationId: org.id,
          lookupValueId: fid,
        })),
        skipDuplicates: true,
      });
    }

    // 6. Publish domain events
    withEvents.commit();

    this.logger.log(`Organization created: ${org.id} (${org.name})`);
    return org.id;
  }
}
