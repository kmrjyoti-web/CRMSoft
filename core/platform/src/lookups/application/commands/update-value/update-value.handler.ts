import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger, Optional, Inject } from '@nestjs/common';
import { PLATFORM_PRISMA, IPlatformPrisma } from '../../../../shared/prisma.token';
import { UpdateValueCommand } from './update-value.command';

@CommandHandler(UpdateValueCommand)
export class UpdateValueHandler implements ICommandHandler<UpdateValueCommand> {
  private readonly logger = new Logger(UpdateValueHandler.name);

  constructor(
    @Optional() @Inject(PLATFORM_PRISMA) private readonly prisma?: IPlatformPrisma,
  ) {}

  async execute(command: UpdateValueCommand): Promise<void> {
    try {
      const val = await this.prisma!.platform.lookupValue.findUnique({
        where: { id: command.valueId },
      });
      if (!val) throw new NotFoundException(`LookupValue ${command.valueId} not found`);

      // If setting as default, unset existing default
      if (command.data.isDefault) {
        await this.prisma!.platform.lookupValue.updateMany({
          where: { lookupId: val.lookupId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const updateData: any = {};
      if (command.data.label) updateData.label = command.data.label.trim();
      if (command.data.icon !== undefined) updateData.icon = command.data.icon || null;
      if (command.data.color !== undefined) updateData.color = command.data.color || null;
      if (command.data.isDefault !== undefined) updateData.isDefault = command.data.isDefault;
      if (command.data.configJson !== undefined) updateData.configJson = command.data.configJson;

      await this.prisma!.platform.lookupValue.update({ where: { id: command.valueId }, data: updateData });
      this.logger.log(`LookupValue ${val.value} updated`);
    } catch (error) {
      this.logger.error(`UpdateValueHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
