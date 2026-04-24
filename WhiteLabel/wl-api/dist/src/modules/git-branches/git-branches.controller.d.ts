import { GitBranchesService } from './git-branches.service';
import { BranchType, BranchScope } from '@prisma/client';
declare class CreateBranchDto {
    partnerId: string;
    branchType?: BranchType;
    parentBranch?: string;
    suffix?: string;
}
declare class UpdateScopeDto {
    allowedScope: BranchScope;
    restrictedModules?: string[];
}
export declare class GitBranchesController {
    private gitBranchesService;
    constructor(gitBranchesService: GitBranchesService);
    create(dto: CreateBranchDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        branchName: string;
        branchType: import("@prisma/client").$Enums.BranchType;
        parentBranch: string | null;
        allowedScope: import("@prisma/client").$Enums.BranchScope;
        restrictedModules: import("@prisma/client/runtime/client").JsonValue | null;
        lastCommitHash: string | null;
        lastCommitAt: Date | null;
        mergeStatus: string | null;
        createdBy: string | null;
    }>;
    list(partnerId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        branchName: string;
        branchType: import("@prisma/client").$Enums.BranchType;
        parentBranch: string | null;
        allowedScope: import("@prisma/client").$Enums.BranchScope;
        restrictedModules: import("@prisma/client/runtime/client").JsonValue | null;
        lastCommitHash: string | null;
        lastCommitAt: Date | null;
        mergeStatus: string | null;
        createdBy: string | null;
    }[]>;
    getStatus(branchId: string): Promise<{
        branchId: string;
        branchName: string;
        ahead: number;
        behind: number;
        lastCommit: string | null;
        mergeStatus: string | null;
    }>;
    mergeUpstream(branchId: string): Promise<{
        success: boolean;
        conflicts: string[];
    }>;
    deleteBranch(branchId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        branchName: string;
        branchType: import("@prisma/client").$Enums.BranchType;
        parentBranch: string | null;
        allowedScope: import("@prisma/client").$Enums.BranchScope;
        restrictedModules: import("@prisma/client/runtime/client").JsonValue | null;
        lastCommitHash: string | null;
        lastCommitAt: Date | null;
        mergeStatus: string | null;
        createdBy: string | null;
    }>;
    updateScope(branchId: string, dto: UpdateScopeDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        branchName: string;
        branchType: import("@prisma/client").$Enums.BranchType;
        parentBranch: string | null;
        allowedScope: import("@prisma/client").$Enums.BranchScope;
        restrictedModules: import("@prisma/client/runtime/client").JsonValue | null;
        lastCommitHash: string | null;
        lastCommitAt: Date | null;
        mergeStatus: string | null;
        createdBy: string | null;
    }>;
}
export {};
