import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateFolderDto, UpdateFolderDto } from './dto/folder.dto';
export declare class FolderController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateFolderDto, userId: string): Promise<ApiResponse<any>>;
    getTree(userId?: string): Promise<ApiResponse<any>>;
    getContents(id: string, page?: number, limit?: number): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateFolderDto): Promise<ApiResponse<any>>;
    delete(id: string): Promise<ApiResponse<null>>;
}
