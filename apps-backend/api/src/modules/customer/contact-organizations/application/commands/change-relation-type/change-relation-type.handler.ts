import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { ChangeRelationTypeCommand } from './change-relation-type.command';
import {
  IContactOrgRepository, CONTACT_ORG_REPOSITORY,
} from '../../../domain/interfaces/contact-org-repository.interface';

@CommandHandler(ChangeRelationTypeCommand)
export class ChangeRelationTypeHandler implements ICommandHandler<ChangeRelationTypeCommand> {
  private readonly logger = new Logger(ChangeRelationTypeHandler.name);

  constructor(
    @Inject(CONTACT_ORG_REPOSITORY) private readonly repo: IContactOrgRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: ChangeRelationTypeCommand): Promise<void> {
    try {
      const mapping = await this.repo.findById(command.mappingId);
      if (!mapping) throw new NotFoundException(`Mapping ${command.mappingId} not found`);
      if (!mapping.isActive) throw new Error('Cannot change relation on deactivated mapping');

      const withEvents = this.publisher.mergeObjectContext(mapping);
      withEvents.changeRelationType(command.relationType);

      await this.repo.save(withEvents);
      withEvents.commit();

      this.logger.log(`Mapping ${command.mappingId} relation → ${command.relationType}`);
    } catch (error) {
      this.logger.error(`ChangeRelationTypeHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
