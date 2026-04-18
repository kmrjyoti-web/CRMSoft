import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { ProfileMatcherService } from '../../../services/profile-matcher.service';
import { FieldMapperService } from '../../../services/field-mapper.service';
import { SelectProfileCommand } from './select-profile.command';
export declare class SelectProfileHandler implements ICommandHandler<SelectProfileCommand> {
    private readonly prisma;
    private readonly profileMatcher;
    private readonly fieldMapper;
    private readonly logger;
    constructor(prisma: PrismaService, profileMatcher: ProfileMatcherService, fieldMapper: FieldMapperService);
    execute(cmd: SelectProfileCommand): Promise<{
        matchStatus: "FULL_MATCH";
        matchScore: number;
        nextStep: string;
        resolvedMapping?: undefined;
        unmatchedHeaders?: undefined;
    } | {
        matchStatus: "PARTIAL" | "NO_MATCH";
        matchScore: number;
        resolvedMapping: any[];
        unmatchedHeaders: string[];
        nextStep: string;
    }>;
    private autoMapRows;
}
