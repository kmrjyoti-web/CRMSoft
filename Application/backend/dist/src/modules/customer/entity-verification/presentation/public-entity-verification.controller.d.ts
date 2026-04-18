import { EntityVerificationService } from '../services/entity-verification.service';
import { ApiResponse } from '../../../../common/utils/api-response';
import { RejectVerificationDto } from './dto/entity-verification.dto';
export declare class PublicEntityVerificationController {
    private readonly service;
    constructor(service: EntityVerificationService);
    getPage(token: string): Promise<ApiResponse<{
        alreadyVerified: boolean;
        entityName: string | null;
        expired?: undefined;
        recordId?: undefined;
        entityType?: undefined;
        details?: undefined;
        expiresAt?: undefined;
    } | {
        expired: boolean;
        entityName: string | null;
        alreadyVerified?: undefined;
        recordId?: undefined;
        entityType?: undefined;
        details?: undefined;
        expiresAt?: undefined;
    } | {
        recordId: string;
        entityType: string;
        entityName: string | null;
        details: any;
        expiresAt: Date;
        alreadyVerified?: undefined;
        expired?: undefined;
    }>>;
    confirm(token: string, req: any): Promise<ApiResponse<{
        success: boolean;
        message: string;
    }>>;
    reject(token: string, dto: RejectVerificationDto, req: any): Promise<ApiResponse<{
        success: boolean;
        message: string;
    }>>;
}
