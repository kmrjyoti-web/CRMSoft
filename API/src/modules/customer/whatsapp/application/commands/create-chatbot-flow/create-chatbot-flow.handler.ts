import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateChatbotFlowCommand } from './create-chatbot-flow.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CreateChatbotFlowCommand)
export class CreateChatbotFlowHandler implements ICommandHandler<CreateChatbotFlowCommand> {
  private readonly logger = new Logger(CreateChatbotFlowHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateChatbotFlowCommand) {
    const flow = await this.prisma.waChatbotFlow.create({
      data: {
        wabaId: cmd.wabaId,
        name: cmd.name,
        triggerKeywords: cmd.triggerKeywords,
        nodes: cmd.nodes,
        status: 'DRAFT',
        createdById: cmd.userId,
      },
    });

    this.logger.log(`Chatbot flow created: ${flow.id} (${cmd.name}) for WABA ${cmd.wabaId}`);
    return flow;
  }
}
