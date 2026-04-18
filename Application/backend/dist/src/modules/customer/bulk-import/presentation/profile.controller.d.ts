import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateProfileDto, UpdateProfileDto, CloneProfileDto } from './dto/profile.dto';
export declare class ProfileController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateProfileDto, user: any): Promise<ApiResponse<any>>;
    list(q: any): Promise<ApiResponse<unknown[]>>;
    detail(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateProfileDto): Promise<ApiResponse<any>>;
    archive(id: string): Promise<ApiResponse<any>>;
    clone(id: string, dto: CloneProfileDto, user: any): Promise<ApiResponse<any>>;
}
