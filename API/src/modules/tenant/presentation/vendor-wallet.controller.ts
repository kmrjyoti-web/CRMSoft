import {
  Controller, Get, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { ApiResponse } from '../../../common/utils/api-response';
import { PrismaService } from '../../../core/prisma/prisma.service';

@ApiTags('Vendor Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor/wallet')
export class VendorWalletController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get vendor wallet balance (stub)' })
  async getBalance() {
    return ApiResponse.success({
      balance: 0,
      currency: 'INR',
      lastUpdated: new Date(),
    });
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List wallet transactions (stub)' })
  async listTransactions(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return ApiResponse.paginated([], 0, +page, +limit);
  }
}
