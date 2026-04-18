import { ICommandHandler } from '@nestjs/cqrs';
import { SendEmailCommand } from './send-email.command';
import { EmailSenderService } from '../../../services/email-sender.service';
export declare class SendEmailHandler implements ICommandHandler<SendEmailCommand> {
    private readonly emailSender;
    private readonly logger;
    constructor(emailSender: EmailSenderService);
    execute(cmd: SendEmailCommand): Promise<void>;
}
