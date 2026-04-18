import { EmailFooterService } from '../services/email-footer.service';
import { CreateEmailFooterDto, UpdateEmailFooterDto } from './dto/email-footer.dto';
export declare class EmailFooterController {
    private readonly service;
    constructor(service: EmailFooterService);
    list(req: any): Promise<{
        id: string;
        tenantId: string;
        name: string;
        isDefault: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        bodyHtml: string;
    }[]>;
    create(req: any, dto: CreateEmailFooterDto): Promise<{
        id: string;
        tenantId: string;
        name: string;
        isDefault: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        bodyHtml: string;
    }>;
    update(req: any, id: string, dto: UpdateEmailFooterDto): Promise<{
        id: string;
        tenantId: string;
        name: string;
        isDefault: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        bodyHtml: string;
    }>;
}
