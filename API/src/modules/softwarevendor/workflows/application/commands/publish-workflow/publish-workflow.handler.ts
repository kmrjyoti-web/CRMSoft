import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { PublishWorkflowCommand } from './publish-workflow.command';

@CommandHandler(PublishWorkflowCommand)
export class PublishWorkflowHandler implements ICommandHandler<PublishWorkflowCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: PublishWorkflowCommand) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: cmd.id },
      include: { states: true, transitions: true },
    });
    if (!workflow) throw new NotFoundException(`Workflow "${cmd.id}" not found`);

    const initialStates = workflow.states.filter((s) => s.stateType === 'INITIAL');
    if (initialStates.length !== 1) throw new BadRequestException('Workflow must have exactly one INITIAL state');
    const terminalStates = workflow.states.filter((s) => s.stateType === 'TERMINAL');
    if (terminalStates.length === 0) throw new BadRequestException('Workflow must have at least one TERMINAL state');

    return this.prisma.workflow.update({
      where: { id: cmd.id },
      data: { version: { increment: 1 }, isActive: true },
    });
  }
}
