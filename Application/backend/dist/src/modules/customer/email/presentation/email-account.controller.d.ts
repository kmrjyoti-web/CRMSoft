import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { ConnectAccountDto, TestConnectionDto, OAuthInitiateDto, OAuthCallbackDto } from './dto/email-account.dto';
import { ImapSmtpService } from '../services/imap-smtp.service';
import { GmailService } from '../services/gmail.service';
import { OutlookService } from '../services/outlook.service';
export declare class EmailAccountController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly imapSmtpService;
    private readonly gmailService;
    private readonly outlookService;
    constructor(commandBus: CommandBus, queryBus: QueryBus, imapSmtpService: ImapSmtpService, gmailService: GmailService, outlookService: OutlookService);
    testConnection(dto: TestConnectionDto): Promise<ApiResponse<{
        smtp: boolean;
        imap: boolean;
    }>>;
    oauthInitiate(dto: OAuthInitiateDto, userId: string, tenantId: string): Promise<ApiResponse<{
        authUrl: string;
        redirectUrl: string;
    }>>;
    oauthCallback(dto: OAuthCallbackDto, userId: string, tenantId: string): Promise<ApiResponse<any>>;
    connect(dto: ConnectAccountDto, userId: string): Promise<ApiResponse<any>>;
    disconnect(id: string, userId: string): Promise<ApiResponse<any>>;
    sync(id: string, userId: string): Promise<ApiResponse<any>>;
    list(userId: string): Promise<ApiResponse<any>>;
    getById(id: string): Promise<ApiResponse<any>>;
}
