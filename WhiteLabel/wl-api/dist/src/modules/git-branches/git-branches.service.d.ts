import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BranchType, BranchScope } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
export declare class GitBranchesService {
    private prisma;
    private audit;
    private config;
    private readonly repoPath;
    constructor(prisma: PrismaService, audit: AuditService, config: ConfigService);
    private buildBranchName;
    createBranch(params: {
        partnerId: string;
        branchType?: BranchType;
        parentBranch?: string;
        suffix?: string;
        createdBy?: string;
    }): Promise<{
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
    listBranches(partnerId: string): Promise<{
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
    getBranchStatus(branchId: string): Promise<{
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
    updateScope(branchId: string, dto: {
        allowedScope: BranchScope;
        restrictedModules?: string[];
    }): Promise<{
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
    enforceScopeRules(branchId: string, changedFiles: string[]): Promise<{
        allowed: boolean;
        violations: string[];
    }>;
}
