import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { UpdateLeadCommand } from './update-lead.command';
import {
  ILeadRepository, LEAD_REPOSITORY,
} from '../../../domain/interfaces/lead-repository.interface';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateLeadCommand)
export class UpdateLeadHandler implements ICommandHandler<UpdateLeadCommand> {
  private readonly logger = new Logger(UpdateLeadHandler.name);

  constructor(
    @Inject(LEAD_REPOSITORY) private readonly repo: ILeadRepository,
    private readonly publisher: EventPublisher,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: UpdateLeadCommand): Promise<void> {
    const lead = await this.repo.findById(command.leadId);
    if (!lead) throw new NotFoundException(`Lead ${command.leadId} not found`);

    const withEvents = this.publisher.mergeObjectContext(lead);
    withEvents.updateDetails(command.data);

    await this.repo.save(withEvents);

    // Replace filters if provided
    if (command.filterIds !== undefined) {
      await this.prisma.leadFilter.deleteMany({
        where: { leadId: lead.id },
      });
      if (command.filterIds.length) {
        await this.prisma.leadFilter.createMany({
          data: command.filterIds.map(fid => ({
            leadId: lead.id,
            lookupValueId: fid,
          })),
          skipDuplicates: true,
        });
      }
    }

    withEvents.commit();
    this.logger.log(`Lead ${lead.leadNumber} updated`);
  }
}
