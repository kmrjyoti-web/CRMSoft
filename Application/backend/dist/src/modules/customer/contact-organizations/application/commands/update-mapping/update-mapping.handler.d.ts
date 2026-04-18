import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateMappingCommand } from './update-mapping.command';
import { IContactOrgRepository } from '../../../domain/interfaces/contact-org-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class UpdateMappingHandler implements ICommandHandler<UpdateMappingCommand> {
    private readonly repo;
    private readonly prisma;
    private readonly logger;
    constructor(repo: IContactOrgRepository, prisma: PrismaService);
    execute(command: UpdateMappingCommand): Promise<void>;
}
