import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { ValidateWorkflowCommand } from './validate-workflow.command';

@CommandHandler(ValidateWorkflowCommand)
export class ValidateWorkflowHandler implements ICommandHandler<ValidateWorkflowCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: ValidateWorkflowCommand) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: cmd.id },
      include: { states: true, transitions: true },
    });
    if (!workflow) throw new NotFoundException(`Workflow "${cmd.id}" not found`);

    const errors: string[] = [];
    const initialStates = workflow.states.filter((s) => s.stateType === 'INITIAL');
    if (initialStates.length === 0) errors.push('No INITIAL state defined');
    if (initialStates.length > 1) errors.push('Multiple INITIAL states found');

    const terminalStates = workflow.states.filter((s) => s.stateType === 'TERMINAL');
    if (terminalStates.length === 0) errors.push('No TERMINAL state defined');

    const stateIds = new Set(workflow.states.map((s) => s.id));
    for (const t of workflow.transitions) {
      if (!stateIds.has(t.fromStateId)) errors.push(`Transition "${t.code}" has invalid fromStateId`);
      if (!stateIds.has(t.toStateId)) errors.push(`Transition "${t.code}" has invalid toStateId`);
    }

    if (initialStates.length === 1) {
      const reachable = new Set<string>();
      const queue = [initialStates[0].id];
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (reachable.has(current)) continue;
        reachable.add(current);
        const outgoing = workflow.transitions.filter((t) => t.fromStateId === current);
        for (const t of outgoing) {
          if (!reachable.has(t.toStateId)) queue.push(t.toStateId);
        }
      }
      for (const state of workflow.states) {
        if (!reachable.has(state.id)) errors.push(`State "${state.code}" is not reachable from INITIAL state`);
      }
    }

    return { valid: errors.length === 0, errors, stateCount: workflow.states.length, transitionCount: workflow.transitions.length };
  }
}
