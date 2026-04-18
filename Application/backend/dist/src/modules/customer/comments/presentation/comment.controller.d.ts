import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class CommentController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateCommentDto, user: any): Promise<ApiResponse<any>>;
    getByEntity(entityType: string, entityId: string, user: any, page?: number, limit?: number): Promise<ApiResponse<any>>;
    getThread(parentId: string, user: any): Promise<ApiResponse<any>>;
    update(id: string, content: string, user: any): Promise<ApiResponse<any>>;
    delete(id: string, user: any): Promise<ApiResponse<any>>;
}
