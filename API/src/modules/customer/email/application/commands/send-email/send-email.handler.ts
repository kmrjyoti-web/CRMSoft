import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SendEmailCommand } from './send-email.command';
import { EmailSenderService } from '../../../services/email-sender.service';

@CommandHandler(SendEmailCommand)
export class SendEmailHandler implements ICommandHandler<SendEmailCommand> {
  private readonly logger = new Logger(SendEmailHandler.name);

  constructor(private readonly emailSender: EmailSenderService) {}

  async execute(cmd: SendEmailCommand) {
    await this.emailSender.send(cmd.emailId);
    this.logger.log(`Email sent: ${cmd.emailId} by user ${cmd.userId}`);
  }
}
