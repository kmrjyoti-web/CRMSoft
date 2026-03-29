import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { SetFieldValueCommand } from './set-field-value.command';

@CommandHandler(SetFieldValueCommand)
export class SetFieldValueHandler
  implements ICommandHandler<SetFieldValueCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: SetFieldValueCommand) {
    const results = await this.prisma.$transaction(async (tx: any) => {
      const saved: any[] = [];
      for (const v of cmd.values) {
        const existing = await tx.entityConfigValue.findFirst({
          where: { definitionId: v.definitionId, entityId: cmd.entityId },
        });

        const data = {
          valueText: v.valueText,
          valueNumber: v.valueNumber,
          valueDate: v.valueDate ? new Date(v.valueDate) : null,
          valueBoolean: v.valueBoolean,
          valueJson: v.valueJson,
          valueDropdown: v.valueDropdown,
        };

        if (existing) {
          saved.push(
            await tx.entityConfigValue.update({
              where: { id: existing.id },
              data,
            }),
          );
        } else {
          saved.push(
            await tx.entityConfigValue.create({
              data: {
                definitionId: v.definitionId,
                entityType: cmd.entityType.toUpperCase(),
                entityId: cmd.entityId,
                ...data,
              },
            }),
          );
        }
      }
      return saved;
    });
    return { saved: results.length };
  }
}
