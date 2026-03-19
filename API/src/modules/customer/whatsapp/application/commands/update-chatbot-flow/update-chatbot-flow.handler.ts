import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UpdateChatbotFlowCommand } from './update-chatbot-flow.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateChatbotFlowCommand)
export class UpdateChatbotFlowHandler implements ICommandHandler<UpdateChatbotFlowCommand> {
  private readonly logger = new Logger(UpdateChatbotFlowHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateChatbotFlowCommand) {
    const updateData: Record<string, any> = {};

    if (cmd.name !== undefined) updateData.name = cmd.name;
    if (cmd.triggerKeywords !== undefined) updateData.triggerKeywords = cmd.triggerKeywords;
    if (cmd.nodes !== undefined) updateData.nodes = cmd.nodes;

    const flow = await this.prisma.waChatbotFlow.update({
      where: { id: cmd.flowId },
      data: updateData,
    });

    this.logger.log(`Chatbot flow updated: ${flow.id}`);
    return flow;
  }
}
