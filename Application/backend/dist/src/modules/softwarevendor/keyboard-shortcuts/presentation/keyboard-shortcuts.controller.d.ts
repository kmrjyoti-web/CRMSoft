import { KeyboardShortcutsService } from '../services/keyboard-shortcuts.service';
import { ApiResponse } from '../../../../common/utils/api-response';
import { UpsertOverrideDto, CreateCustomShortcutDto, CheckConflictDto } from './dto/shortcut.dto';
export declare class KeyboardShortcutsController {
    private readonly service;
    constructor(service: KeyboardShortcutsService);
    getAll(user: any): Promise<ApiResponse<{
        id: string;
        code: string;
        label: string;
        description: string | null;
        category: string;
        actionType: string;
        targetPath: string | null;
        targetModule: string | null;
        targetFunction: string | null;
        defaultKey: string;
        activeKey: string;
        isCustomized: boolean;
        isLocked: boolean;
        isSystem: boolean;
        sortOrder: number;
    }[]>>;
    upsertOverride(user: any, shortcutId: string, dto: UpsertOverrideDto): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        userId: string;
        customKey: string;
        shortcutId: string;
    }>>;
    removeOverride(user: any, shortcutId: string): Promise<ApiResponse<{
        reset: boolean;
    }>>;
    resetAll(user: any): Promise<ApiResponse<{
        reset: number;
    }>>;
    createCustom(user: any, dto: CreateCustomShortcutDto): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        code: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        category: string;
        sortOrder: number;
        label: string;
        isSystem: boolean;
        targetFunction: string | null;
        isLocked: boolean;
        targetModule: string | null;
        targetPath: string | null;
        actionType: string;
        defaultKey: string;
    }>>;
    checkConflict(user: any, dto: CheckConflictDto): Promise<ApiResponse<{
        hasConflict: boolean;
        conflictsWith: string;
    } | {
        hasConflict: boolean;
        conflictsWith: null;
    }>>;
}
