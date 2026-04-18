import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../../common/utils/api-response';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { RegisterPushDto } from './dto/register-push.dto';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/create-template.dto';
export declare class NotificationSettingsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    getPreferences(userId: string): Promise<ApiResponse<any>>;
    updatePreferences(dto: UpdatePreferencesDto, userId: string): Promise<ApiResponse<any>>;
    registerPush(dto: RegisterPushDto, userId: string): Promise<ApiResponse<any>>;
    unregisterPush(endpoint: string, userId: string): Promise<ApiResponse<any>>;
    getTemplates(category?: string): Promise<ApiResponse<any>>;
    createTemplate(dto: CreateTemplateDto): Promise<ApiResponse<any>>;
    updateTemplate(id: string, dto: UpdateTemplateDto): Promise<ApiResponse<any>>;
}
