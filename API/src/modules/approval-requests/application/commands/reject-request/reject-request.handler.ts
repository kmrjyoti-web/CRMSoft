import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RejectRequestCommand } from './reject-request.command';
import { MakerCheckerEngine } from '../../../../../core/permissions/engines/maker-checker.engine';

@CommandHandler(RejectRequestCommand)
export class RejectRequestHandler implements ICommandHandler<RejectRequestCommand> {
  constructor(private readonly makerChecker: MakerCheckerEngine) {}

  async execute(cmd: RejectRequestCommand) {
    return this.makerChecker.reject(cmd.requestId, cmd.checkerId, cmd.note);
  }
}
