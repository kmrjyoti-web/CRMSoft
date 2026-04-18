import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { ApiResponse } from '../../../../common/utils/api-response';
import { ExportReportDto } from './dto/export-report.dto';
export declare class ReportsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    exportReport(dto: ExportReportDto, user: any): Promise<ApiResponse<any>>;
    exportHistory(userId: string, page?: string, limit?: string): Promise<ApiResponse<any>>;
    download(id: string, res: Response): Promise<void>;
}
