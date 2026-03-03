import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UnlinkEmailFromEntityCommand } from './unlink-email-from-entity.command';
import { EmailLinkerService } from '../../../services/email-linker.service';

@CommandHandler(UnlinkEmailFromEntityCommand)
export class UnlinkEmailFromEntityHandler implements ICommandHandler<UnlinkEmailFromEntityCommand> {
  private readonly logger = new Logger(UnlinkEmailFromEntityHandler.name);

  constructor(private readonly emailLinker: EmailLinkerService) {}

  async execute(cmd: UnlinkEmailFromEntityCommand) {
    await this.emailLinker.unlink(cmd.emailId);
    this.logger.log(`Email ${cmd.emailId} unlinked from entity by user ${cmd.userId}`);
  }
}
