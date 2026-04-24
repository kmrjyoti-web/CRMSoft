"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitBranchesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const child_process_1 = require("child_process");
const util_1 = require("util");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let GitBranchesService = class GitBranchesService {
    prisma;
    audit;
    config;
    repoPath;
    constructor(prisma, audit, config) {
        this.prisma = prisma;
        this.audit = audit;
        this.config = config;
        this.repoPath = this.config.get('CRMSOFT_REPO_PATH', '/Users/kmrjyoti/GitProject/CRMSoft/CrmProjectDevlopment');
    }
    buildBranchName(partnerCode, type, suffix) {
        const base = `partner/${partnerCode}`;
        switch (type) {
            case 'MAIN': return `${base}/main`;
            case 'FEATURE': return `${base}/feature-${suffix || 'new'}`;
            case 'HOTFIX': return `${base}/hotfix-${suffix || 'fix'}`;
            case 'CUSTOM': return `${base}/${suffix || 'custom'}`;
            default: return `${base}/main`;
        }
    }
    async createBranch(params) {
        const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: params.partnerId } });
        if (!partner)
            throw new common_1.NotFoundException('Partner not found');
        const branchType = params.branchType || client_1.BranchType.MAIN;
        const branchName = this.buildBranchName(partner.partnerCode, branchType, params.suffix);
        const parent = params.parentBranch || 'main';
        let lastCommitHash;
        try {
            await execAsync(`git -C "${this.repoPath}" branch "${branchName}" "${parent}" 2>/dev/null || true`);
            const { stdout } = await execAsync(`git -C "${this.repoPath}" rev-parse "${branchName}" 2>/dev/null || echo ""`);
            lastCommitHash = stdout.trim() || undefined;
        }
        catch { }
        const branch = await this.prisma.partnerGitBranch.create({
            data: {
                partnerId: params.partnerId,
                branchName,
                branchType,
                parentBranch: parent,
                lastCommitHash,
                mergeStatus: 'CLEAN',
                createdBy: params.createdBy,
                isActive: true,
            },
        });
        await this.audit.log({
            partnerId: params.partnerId,
            action: 'GIT_BRANCH_CREATED',
            performedBy: params.createdBy || 'admin',
            performedByRole: 'MASTER_ADMIN',
            details: { branchName, branchType },
        });
        return branch;
    }
    async listBranches(partnerId) {
        return this.prisma.partnerGitBranch.findMany({
            where: { partnerId, isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getBranchStatus(branchId) {
        const branch = await this.prisma.partnerGitBranch.findUnique({ where: { id: branchId } });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        let ahead = 0;
        let behind = 0;
        let lastCommit = branch.lastCommitHash;
        try {
            const { stdout: aheadOut } = await execAsync(`git -C "${this.repoPath}" log "main..${branch.branchName}" --oneline 2>/dev/null | wc -l`);
            const { stdout: behindOut } = await execAsync(`git -C "${this.repoPath}" log "${branch.branchName}..main" --oneline 2>/dev/null | wc -l`);
            ahead = parseInt(aheadOut.trim()) || 0;
            behind = parseInt(behindOut.trim()) || 0;
        }
        catch { }
        return { branchId, branchName: branch.branchName, ahead, behind, lastCommit, mergeStatus: branch.mergeStatus };
    }
    async mergeUpstream(branchId) {
        const branch = await this.prisma.partnerGitBranch.findUnique({ where: { id: branchId } });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        let success = true;
        let conflicts = [];
        try {
            await execAsync(`git -C "${this.repoPath}" checkout "${branch.branchName}"`);
            const { stdout, stderr } = await execAsync(`git -C "${this.repoPath}" merge main --no-commit 2>&1 || echo "CONFLICT"`);
            if (stdout.includes('CONFLICT') || stderr.includes('CONFLICT')) {
                success = false;
                conflicts = ['Merge conflicts detected'];
                await execAsync(`git -C "${this.repoPath}" merge --abort 2>/dev/null || true`);
            }
        }
        catch { }
        const mergeStatus = success ? 'CLEAN' : 'CONFLICTS';
        await this.prisma.partnerGitBranch.update({
            where: { id: branchId },
            data: { mergeStatus, lastCommitAt: new Date() },
        });
        await this.audit.log({
            partnerId: branch.partnerId,
            action: 'GIT_MERGE_UPSTREAM',
            performedBy: 'admin',
            performedByRole: 'MASTER_ADMIN',
            details: { branchName: branch.branchName, success, conflicts },
        });
        return { success, conflicts };
    }
    async deleteBranch(branchId) {
        const branch = await this.prisma.partnerGitBranch.findUnique({ where: { id: branchId } });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        if (branch.branchType === client_1.BranchType.MAIN)
            throw new common_1.BadRequestException('Cannot delete MAIN branch');
        try {
            await execAsync(`git -C "${this.repoPath}" branch -d "${branch.branchName}" 2>/dev/null || true`);
        }
        catch { }
        return this.prisma.partnerGitBranch.update({ where: { id: branchId }, data: { isActive: false } });
    }
    async updateScope(branchId, dto) {
        const branch = await this.prisma.partnerGitBranch.findUnique({ where: { id: branchId } });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        return this.prisma.partnerGitBranch.update({ where: { id: branchId }, data: dto });
    }
    async enforceScopeRules(branchId, changedFiles) {
        const branch = await this.prisma.partnerGitBranch.findUnique({ where: { id: branchId } });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        if (branch.allowedScope !== client_1.BranchScope.FUNCTION_SPECIFIC) {
            return { allowed: true, violations: [] };
        }
        const restricted = branch.restrictedModules || [];
        const violations = changedFiles.filter((f) => !restricted.some((m) => f.includes(m)));
        return { allowed: violations.length === 0, violations };
    }
};
exports.GitBranchesService = GitBranchesService;
exports.GitBranchesService = GitBranchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        config_1.ConfigService])
], GitBranchesService);
//# sourceMappingURL=git-branches.service.js.map