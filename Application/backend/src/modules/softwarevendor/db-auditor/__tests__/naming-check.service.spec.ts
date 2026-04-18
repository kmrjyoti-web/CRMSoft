import { Test, TestingModule } from '@nestjs/testing';
import { NamingCheckService } from '../checks/naming-check.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import * as fs from 'fs';

jest.mock('fs');

const mockPrisma = {
  platform: {
    gvCfgVertical: {
      findMany: jest.fn().mockResolvedValue([
        { code: 'gv', tablePrefix: 'gv_' },
        { code: 'soft', tablePrefix: 'soft_' },
      ]),
    },
  },
};

describe('NamingCheckService', () => {
  let service: NamingCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NamingCheckService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(NamingCheckService);
    jest.clearAllMocks();
    mockPrisma.platform.gvCfgVertical.findMany.mockResolvedValue([
      { code: 'gv', tablePrefix: 'gv_' },
      { code: 'soft', tablePrefix: 'soft_' },
    ]);
    // Sprint F: service uses fs.readdirSync to enumerate *.prisma files in
    // prismaSchemaFolder. Each test overrides readFileSync to return its
    // fixture content; readdirSync must return a single-file list so the
    // service reads that fixture via readFileSync.
    (fs.readdirSync as jest.Mock).mockReturnValue(['schema.prisma']);
  });

  it('should return no findings for valid snake_case tables with known prefix', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(`
      model GvCfgVertical {
        id String @id
        @@map("gv_cfg_vertical")
      }
    `);

    const findings = await service.run('Platform');
    const errors = findings.filter((f) => f.severity === 'error');
    expect(errors).toHaveLength(0);
  });

  it('should flag model without @@map', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(`
      model BadModel {
        id String @id
      }
    `);

    const findings = await service.run('Platform');
    expect(findings.some((f) => f.rule === 'missing-map')).toBe(true);
  });

  it('should warn on vertical prefix with invalid module code', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(`
      model GvBadModule {
        id String @id
        @@map("gv_xxx_table")
      }
    `);

    const findings = await service.run('Platform');
    expect(findings.some((f) => f.rule === 'second-segment-must-be-locked-module-code')).toBe(true);
  });

  it('should skip _deprecated_ tables', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(`
      model OldTable {
        id String @id
        @@map("_deprecated_old_table")
      }
    `);

    const findings = await service.run('Platform');
    expect(findings).toHaveLength(0);
  });

  it('should flag non-snake_case table name', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(`
      model CamelCase {
        id String @id
        @@map("CamelCaseTable")
      }
    `);

    const findings = await service.run('Platform');
    expect(findings.some((f) => f.rule === 'snake-case')).toBe(true);
  });

  // ─── FALSE-NEGATIVE REGRESSION GUARDS ─────────────────────────
  // These tests prove the bug exists (should FAIL before fix, PASS after)

  describe('false-negative regression guards', () => {
    it('flags unprefixed tables as errors (not silently skipped)', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(`
        model AccountGroup {
          id String @id
          @@map("account_groups")
        }
      `);

      const findings = await service.run('IdentityDB');
      expect(findings).toHaveLength(1);
      expect(findings[0].severity).toBe('error');
      expect(findings[0].rule).toBe('must-start-with-allowed-prefix');
    });

    it('flags tables with unknown prefix as errors', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(`
        model AiModel {
          id String @id
          @@map("ai_models")
        }
      `);

      const findings = await service.run('IdentityDB');
      expect(findings).toHaveLength(1);
      expect(findings[0].severity).toBe('error');
      expect(findings[0].rule).toBe('must-start-with-allowed-prefix');
    });

    it('flags conforming-prefix but wrong module code as errors', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(`
        model GvFooBar {
          id String @id
          @@map("gv_xyz_thing")
        }
      `);

      const findings = await service.run('IdentityDB');
      expect(
        findings.some((f) => f.rule === 'second-segment-must-be-locked-module-code'),
      ).toBe(true);
    });

    it('passes correctly-named tables', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(`
        model GvCfgVertical {
          id String @id
          @@map("gv_cfg_vertical")
        }
      `);

      const findings = await service.run('IdentityDB');
      expect(findings).toHaveLength(0);
    });

    it('skips _deprecated_ tables (Sprint A artifacts)', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(`
        model OldThing {
          id String @id
          @@map("_deprecated_old_thing")
        }
      `);

      const findings = await service.run('IdentityDB');
      expect(findings).toHaveLength(0);
    });

    it('skips _prisma_ migration tables', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(`
        model PrismaMigrations {
          id String @id
          @@map("_prisma_migrations")
        }
      `);

      const findings = await service.run('IdentityDB');
      expect(findings).toHaveLength(0);
    });

    it('accepts gv_qa_* tables as valid (19th module code)', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(`
        model GvQaTestPlan {
          id String @id
          @@map("gv_qa_test_plans")
        }
      `);

      const findings = await service.run('IdentityDB');
      expect(findings).toHaveLength(0);
    });

    it('still rejects unknown module codes after qa addition', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(`
        model GvXyzThing {
          id String @id
          @@map("gv_xyz_thing")
        }
      `);

      const findings = await service.run('IdentityDB');
      expect(
        findings.some((f) => f.rule === 'second-segment-must-be-locked-module-code'),
      ).toBe(true);
    });
  });
});
