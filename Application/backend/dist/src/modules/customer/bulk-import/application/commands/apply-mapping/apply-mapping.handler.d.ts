import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { FieldMapperService } from '../../../services/field-mapper.service';
import { ApplyMappingCommand } from './apply-mapping.command';
export declare class ApplyMappingHandler implements ICommandHandler<ApplyMappingCommand> {
    private readonly prisma;
    private readonly fieldMapper;
    private readonly logger;
    constructor(prisma: PrismaService, fieldMapper: FieldMapperService);
    execute(cmd: ApplyMappingCommand): Promise<{
        mapped: boolean;
        rowCount: number;
    }>;
}
