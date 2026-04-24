import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PermanentDeleteLeadCommand } from './permanent-delete-lead.command';
import {
  ILeadRepository, LEAD_REPOSITORY,
} from '../../../domain/interfaces/lead-repository.interface';

@CommandHandler(PermanentDeleteLeadCommand)
export class PermanentDeleteLeadHandler implements ICommandHandler<PermanentDeleteLeadCommand> {
  private readonly logger = new Logger(PermanentDeleteLeadHandler.name);

  constructor(
    @Inject(LEAD_REPOSITORY) private readonly repo: ILeadRepository,
  ) {}

  async execute(command: PermanentDeleteLeadCommand): Promise<void> {
    try {
      const lead = await this.repo.findById(command.leadId);
      if (!lead) throw new NotFoundException(`Lead ${command.leadId} not found`);

      if (!lead.isDeleted) {
        throw new BadRequestException(
          'Lead must be soft-deleted before permanent deletion',
        );
      }

      await this.repo.delete(command.leadId);

      this.logger.log(`Lead ${command.leadId} permanently deleted`);
    } catch (error) {
      this.logger.error(`PermanentDeleteLeadHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
