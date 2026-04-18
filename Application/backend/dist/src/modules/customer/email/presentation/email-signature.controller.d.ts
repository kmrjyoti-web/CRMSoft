import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateSignatureDto, UpdateSignatureDto } from './dto/signature.dto';
export declare class EmailSignatureController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateSignatureDto, userId: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateSignatureDto): Promise<ApiResponse<any>>;
    delete(id: string): Promise<ApiResponse<null>>;
    list(userId: string): Promise<ApiResponse<any>>;
}
