import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../../common/utils/api-response';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
export declare class NotificationController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    send(dto: SendNotificationDto, userId: string): Promise<ApiResponse<any>>;
    list(query: NotificationQueryDto, userId: string): Promise<ApiResponse<unknown[]>>;
    unreadCount(userId: string): Promise<ApiResponse<any>>;
    stats(userId: string): Promise<ApiResponse<any>>;
    getById(id: string, userId: string): Promise<ApiResponse<any>>;
    markRead(id: string, userId: string): Promise<ApiResponse<any>>;
    markAllRead(userId: string, category?: string): Promise<ApiResponse<any>>;
    dismiss(id: string, userId: string): Promise<ApiResponse<any>>;
    bulkRead(ids: string[], userId: string): Promise<ApiResponse<any>>;
    bulkDismiss(ids: string[], userId: string): Promise<ApiResponse<any>>;
}
