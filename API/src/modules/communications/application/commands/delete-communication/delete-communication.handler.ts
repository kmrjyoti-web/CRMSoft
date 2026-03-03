import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { DeleteCommunicationCommand } from './delete-communication.command';
import {
  ICommunicationRepository, COMMUNICATION_REPOSITORY,
} from '../../../domain/interfaces/communication-repository.interface';

@CommandHandler(DeleteCommunicationCommand)
export class DeleteCommunicationHandler implements ICommandHandler<DeleteCommunicationCommand> {
  private readonly logger = new Logger(DeleteCommunicationHandler.name);

  constructor(
    @Inject(COMMUNICATION_REPOSITORY) private readonly repo: ICommunicationRepository,
  ) {}

  async execute(command: DeleteCommunicationCommand): Promise<void> {
    const comm = await this.repo.findById(command.communicationId);
    if (!comm) throw new NotFoundException(`Communication ${command.communicationId} not found`);

    await this.repo.delete(command.communicationId);
    this.logger.log(`Communication ${command.communicationId} deleted`);
  }
}
