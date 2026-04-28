import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { Public } from '../../../common/decorators/roles.decorator';

/**
 * GET /api/v1/public/brand-config
 * Public endpoint — no auth required.
 * Returns master code structure for a given partnerCode so frontend apps
 * can build dynamic registration/onboarding flows.
 */
@ApiTags('Public — Brand Config')
@Controller('api/v1/public/brand-config')
export class BrandConfigPublicController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get brand config (master codes + user types) for a partnerCode' })
  async getBrandConfig(@Query('partnerCode') partnerCode: string) {
    const where: any = { isActive: true };
    if (partnerCode) where.partnerCode = partnerCode.toUpperCase();

    const masterCodes = await this.prisma.pcMasterCode.findMany({
      where,
      include: {
        configs: {
          where: { isActive: true },
          orderBy: { userTypeCode: 'asc' },
        },
      },
      orderBy: { masterCode: 'asc' },
    });

    const result = masterCodes.map((master) => {
      // Group configs by userTypeCode
      const userTypeMap = new Map<
        string,
        { code: string; subTypes: { code: string; displayName: string; resolvedCode: string; extraRegFields: unknown[] }[] }
      >();

      for (const config of master.configs) {
        if (!userTypeMap.has(config.userTypeCode)) {
          userTypeMap.set(config.userTypeCode, { code: config.userTypeCode, subTypes: [] });
        }
        if (config.subTypeCode) {
          userTypeMap.get(config.userTypeCode)!.subTypes.push({
            code: config.subTypeCode,
            displayName: config.displayName,
            resolvedCode: config.resolvedCode,
            extraRegFields: (config.extraRegFields as unknown[]) ?? [],
          });
        }
      }

      return {
        masterCode: master.masterCode,
        partnerCode: master.partnerCode,
        editionCode: master.editionCode,
        brandCode: master.brandCode,
        verticalCode: master.verticalCode,
        displayName: master.displayName,
        commonRegFields: (master.commonRegFields as unknown[]) ?? [],
        commonOnboardingStages: (master.commonOnboardingStages as unknown[]) ?? [],
        userTypes: Array.from(userTypeMap.values()),
      };
    });

    return ApiResponse.success(result, 'Brand config retrieved');
  }
}
