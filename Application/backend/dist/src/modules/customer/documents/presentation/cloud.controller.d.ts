import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { ConnectCloudDto } from './dto/cloud.dto';
import { StorageProvider } from '@prisma/working-client';
export declare class CloudController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    connect(dto: ConnectCloudDto, userId: string): Promise<ApiResponse<any>>;
    list(userId: string): Promise<ApiResponse<any>>;
    disconnect(provider: StorageProvider, userId: string): Promise<ApiResponse<null>>;
}
