import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { UpdateContactCommand } from './update-contact.command';
import {
  IContactRepository, CONTACT_REPOSITORY,
} from '../../../domain/interfaces/contact-repository.interface';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateContactCommand)
export class UpdateContactHandler implements ICommandHandler<UpdateContactCommand> {
  private readonly logger = new Logger(UpdateContactHandler.name);

  constructor(
    @Inject(CONTACT_REPOSITORY) private readonly repo: IContactRepository,
    private readonly publisher: EventPublisher,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: UpdateContactCommand): Promise<void> {
    const contact = await this.repo.findById(command.contactId);
    if (!contact) throw new NotFoundException(`Contact ${command.contactId} not found`);

    const withEvents = this.publisher.mergeObjectContext(contact);
    withEvents.updateDetails(command.data, command.updatedById);

    await this.repo.save(withEvents);

    // Update filters (replace strategy: delete all, re-create)
    if (command.filterIds !== undefined) {
      await this.prisma.contactFilter.deleteMany({
        where: { contactId: contact.id },
      });
      if (command.filterIds.length) {
        await this.prisma.contactFilter.createMany({
          data: command.filterIds.map(fid => ({
            contactId: contact.id,
            lookupValueId: fid,
          })),
          skipDuplicates: true,
        });
      }
    }

    withEvents.commit();
    this.logger.log(`Contact ${contact.id} updated`);
  }
}
