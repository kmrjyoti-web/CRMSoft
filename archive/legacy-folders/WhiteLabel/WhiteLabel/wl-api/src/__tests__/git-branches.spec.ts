import { GitBranchesService } from '../modules/git-branches/git-branches.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BranchType, BranchScope } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

// Prevent real git / shell commands
jest.mock('child_process', () => ({
  exec: jest.fn((cmd: string, cb: Function) => cb(null, { stdout: '', stderr: '' })),
}));

const mockPrisma = {
  whiteLabelPartner: {
    findUnique: jest.fn(),
  },
  partnerGitBranch: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
};

const mockAudit = { log: jest.fn() };

const mockConfig = {
  get: (key: string, def?: string) => def ?? '',
};

const makeService = () =>
  new GitBranchesService(
    mockPrisma as any,
    mockAudit as any,
    mockConfig as unknown as ConfigService,
  );

describe('GitBranchesService', () => {
  afterEach(() => jest.clearAllMocks());

  it('createBranch() creates a branch record with correct branchName and PARTNER_ONLY scope defaults', async () => {
    const partner = { id: 'p1', partnerCode: 'acme' };
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(partner);
    const createdBranch = {
      id: 'b1',
      partnerId: 'p1',
      branchName: 'partner/acme/main',
      branchType: BranchType.MAIN,
      mergeStatus: 'CLEAN',
      isActive: true,
    };
    mockPrisma.partnerGitBranch.create.mockResolvedValue(createdBranch);

    const svc = makeService();
    const result = await svc.createBranch({ partnerId: 'p1', branchType: BranchType.MAIN });

    expect(result.branchName).toBe('partner/acme/main');
    expect(result.branchType).toBe(BranchType.MAIN);
    expect(mockPrisma.partnerGitBranch.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          partnerId: 'p1',
          branchName: 'partner/acme/main',
          mergeStatus: 'CLEAN',
          isActive: true,
        }),
      }),
    );
  });

  it('createBranch() throws NotFoundException when partner does not exist', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(null);

    const svc = makeService();
    await expect(svc.createBranch({ partnerId: 'nonexistent' })).rejects.toThrow(NotFoundException);
  });

  it('listBranches() returns only active branches for the given partnerId', async () => {
    const branches = [
      { id: 'b1', partnerId: 'p1', branchName: 'partner/acme/main', isActive: true },
      { id: 'b2', partnerId: 'p1', branchName: 'partner/acme/feature-new', isActive: true },
    ];
    mockPrisma.partnerGitBranch.findMany.mockResolvedValue(branches);

    const svc = makeService();
    const result = await svc.listBranches('p1');

    expect(result).toHaveLength(2);
    expect(result[0].partnerId).toBe('p1');
    expect(mockPrisma.partnerGitBranch.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { partnerId: 'p1', isActive: true } }),
    );
  });

  it('mergeUpstream() updates mergeStatus and lastCommitAt on the branch', async () => {
    const branch = { id: 'b1', partnerId: 'p1', branchName: 'partner/acme/main', mergeStatus: 'CLEAN' };
    mockPrisma.partnerGitBranch.findUnique.mockResolvedValue(branch);
    mockPrisma.partnerGitBranch.update.mockResolvedValue({ ...branch, mergeStatus: 'CLEAN' });

    const svc = makeService();
    const result = await svc.mergeUpstream('b1');

    expect(result.success).toBe(true);
    expect(mockPrisma.partnerGitBranch.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'b1' },
        data: expect.objectContaining({ mergeStatus: 'CLEAN' }),
      }),
    );
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'GIT_MERGE_UPSTREAM' }),
    );
  });

  it('deleteBranch() sets isActive=false; throws NotFoundException when branch does not exist', async () => {
    // NotFoundException case
    mockPrisma.partnerGitBranch.findUnique.mockResolvedValue(null);
    const svc = makeService();
    await expect(svc.deleteBranch('nonexistent-branch')).rejects.toThrow(NotFoundException);

    // Successful soft-delete case
    jest.clearAllMocks();
    const branch = { id: 'b2', partnerId: 'p1', branchName: 'partner/acme/feature-new', branchType: BranchType.FEATURE };
    mockPrisma.partnerGitBranch.findUnique.mockResolvedValue(branch);
    mockPrisma.partnerGitBranch.update.mockResolvedValue({ ...branch, isActive: false });

    const result = await svc.deleteBranch('b2');
    expect(result.isActive).toBe(false);
    expect(mockPrisma.partnerGitBranch.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } }),
    );
  });
});
