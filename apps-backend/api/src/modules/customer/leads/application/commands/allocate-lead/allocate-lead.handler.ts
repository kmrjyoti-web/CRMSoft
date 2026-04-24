import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { AllocateLeadCommand } from './allocate-lead.command';
import {
  ILeadRepository, LEAD_REPOSITORY,
} from '../../../domain/interfaces/lead-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

/**
 * Allocate a Lead to a sales executive.
 * Domain entity validates: only NEW/VERIFIED leads can be allocated.
 */
@CommandHandler(AllocateLeadCommand)
export class AllocateLeadHandler implements ICommandHandler<AllocateLeadCommand> {
  private readonly logger = new Logger(AllocateLeadHandler.name);

  constructor(
    @Inject(LEAD_REPOSITORY) private readonly repo: ILeadRepository,
    private readonly publisher: EventPublisher,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: AllocateLeadCommand): Promise<void> {
    try {
      // 1. Load lead
      const lead = await this.repo.findById(command.leadId);
      if (!lead) throw new NotFoundException(`Lead ${command.leadId} not found`);

      // 2. Validate user exists
      const user = await this.prisma.user.findUnique({
        where: { id: command.allocatedToId },
        select: { id: true, status: true },
      });
      if (!user) throw new NotFoundException(`User ${command.allocatedToId} not found`);
      if (user.status !== 'ACTIVE') throw new Error('Cannot allocate to inactive user');

      // 3. Domain validates transition (NEW/VERIFIED → ALLOCATED)
      const withEvents = this.publisher.mergeObjectContext(lead);
      withEvents.allocate(command.allocatedToId);

      // 4. Save + publish
      await this.repo.save(withEvents);
      withEvents.commit();

      this.logger.log(`Lead ${lead.leadNumber} allocated to ${command.allocatedToId}`);
    } catch (error) {
      this.logger.error(`AllocateLeadHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
