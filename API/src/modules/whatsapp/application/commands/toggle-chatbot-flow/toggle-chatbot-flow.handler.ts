import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ToggleChatbotFlowCommand } from './toggle-chatbot-flow.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { WaChatbotFlowStatus } from '@prisma/client';

@CommandHandler(ToggleChatbotFlowCommand)
export class ToggleChatbotFlowHandler implements ICommandHandler<ToggleChatbotFlowCommand> {
  private readonly logger = new Logger(ToggleChatbotFlowHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: ToggleChatbotFlowCommand) {
    const flow = await this.prisma.waChatbotFlow.update({
      where: { id: cmd.flowId },
      data: { status: cmd.status as WaChatbotFlowStatus },
    });

    this.logger.log(`Chatbot flow ${flow.id} status changed to ${cmd.status}`);
    return flow;
  }
}
