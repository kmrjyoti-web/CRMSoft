import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { UpdateMappingCommand } from './update-mapping.command';
import {
  IContactOrgRepository, CONTACT_ORG_REPOSITORY,
} from '../../../domain/interfaces/contact-org-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateMappingCommand)
export class UpdateMappingHandler implements ICommandHandler<UpdateMappingCommand> {
  private readonly logger = new Logger(UpdateMappingHandler.name);

  constructor(
    @Inject(CONTACT_ORG_REPOSITORY) private readonly repo: IContactOrgRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: UpdateMappingCommand): Promise<void> {
    const mapping = await this.repo.findById(command.mappingId);
    if (!mapping) throw new NotFoundException(`Mapping ${command.mappingId} not found`);
    if (!mapping.isActive) throw new Error('Cannot update deactivated mapping');

    const updateData: any = {};
    if (command.data.designation !== undefined) updateData.designation = command.data.designation;
    if (command.data.department !== undefined) updateData.department = command.data.department;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields provided to update');
    }

    await this.prisma.contactOrganization.update({
      where: { id: command.mappingId },
      data: updateData,
    });

    this.logger.log(`Mapping ${command.mappingId} updated`);
  }
}
