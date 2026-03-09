import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { RequireVerification } from '../../verification/decorators/require-verification.decorator';
import { VerificationGuard } from '../../verification/guards/verification.guard';
import { ListingService } from '../services/listing.service';
import { PostService } from '../services/post.service';
import { EnquiryService } from '../services/enquiry.service';
import { OrderService } from '../services/order.service';

// ═══════════════════════════════════════════════════════
// LISTINGS
// ═══════════════════════════════════════════════════════

@Controller('marketplace/listings')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Get()
  async list(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.listingService.findMany(
      tenantId,
      {
        listingType: type as any,
        category,
        search,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      },
      { page, limit },
      userId,
    );
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.listingService.findById(id, userId);
  }

  @Post()
  @RequirePermissions('marketplace:create')
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.listingService.create(tenantId, userId, body);
  }

  @Put(':id')
  @RequirePermissions('marketplace:update')
  async update(
    @Param('id') id: string,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.listingService.update(id, tenantId, userId, body);
  }

  @Get('vendor/mine')
  async myListings(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.listingService.getVendorListings(tenantId, userId);
  }
}

// ═══════════════════════════════════════════════════════
// POSTS
// ═══════════════════════════════════════════════════════

@Controller('marketplace/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('feed')
  async getFeed(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.postService.getFeed(tenantId, { page, limit }, userId);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.postService.findById(id);
  }

  @Post()
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.postService.create(tenantId, userId, body);
  }

  @Post(':id/like')
  @UseGuards(VerificationGuard)
  @RequireVerification('like')
  @HttpCode(200)
  async toggleLike(
    @Param('id') postId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.postService.toggleLike(postId, userId, tenantId);
  }

  @Post(':id/save')
  @UseGuards(VerificationGuard)
  @RequireVerification('save')
  @HttpCode(200)
  async toggleSave(
    @Param('id') postId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.postService.toggleSave(postId, userId, tenantId);
  }

  @Post(':id/comment')
  @UseGuards(VerificationGuard)
  @RequireVerification('comment')
  @HttpCode(201)
  async addComment(
    @Param('id') postId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: { content: string; parentId?: string },
  ) {
    return this.postService.addComment(postId, userId, tenantId, body.content, body.parentId);
  }

  @Post(':id/share')
  @HttpCode(200)
  async trackShare(
    @Param('id') postId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: { sharedTo: string },
  ) {
    return this.postService.trackShare(postId, userId, tenantId, body.sharedTo);
  }
}

// ═══════════════════════════════════════════════════════
// ENQUIRIES
// ═══════════════════════════════════════════════════════

@Controller('marketplace/enquiries')
export class EnquiryController {
  constructor(private readonly enquiryService: EnquiryService) {}

  @Post()
  @UseGuards(VerificationGuard)
  @RequireVerification('enquiry')
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.enquiryService.create(tenantId, userId, body);
  }

  @Get('vendor')
  async vendorEnquiries(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
  ) {
    return this.enquiryService.getVendorEnquiries(tenantId, userId, status as any);
  }

  @Get('buyer')
  async buyerEnquiries(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.enquiryService.getBuyerEnquiries(tenantId, userId);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.enquiryService.findById(id);
  }

  @Post(':id/reply')
  @HttpCode(200)
  async reply(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { message: string; senderType: 'BUYER' | 'VENDOR' },
  ) {
    return this.enquiryService.reply(id, userId, body.senderType, body.message);
  }

  @Post(':id/read')
  @HttpCode(200)
  async markRead(
    @Param('id') id: string,
    @Body() body: { readerType: 'BUYER' | 'VENDOR' },
  ) {
    return this.enquiryService.markRead(id, body.readerType);
  }
}

// ═══════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════

@Controller('marketplace/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(VerificationGuard)
  @RequireVerification('order')
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.orderService.create(tenantId, userId, body);
  }

  @Get('vendor')
  async vendorOrders(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
  ) {
    return this.orderService.getVendorOrders(tenantId, userId, status as any);
  }

  @Get('buyer')
  async buyerOrders(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orderService.getBuyerOrders(tenantId, userId);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.orderService.findById(id);
  }

  @Put(':id/status')
  @RequirePermissions('marketplace:update')
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { status: string; note?: string },
  ) {
    return this.orderService.updateStatus(id, body.status as any, body.note, userId);
  }

  @Put(':id/tracking')
  @RequirePermissions('marketplace:update')
  async updateTracking(
    @Param('id') id: string,
    @Body() body: { trackingNumber: string; carrier: string; estimatedDelivery?: string },
  ) {
    return this.orderService.updateTracking(
      id,
      body.trackingNumber,
      body.carrier,
      body.estimatedDelivery ? new Date(body.estimatedDelivery) : undefined,
    );
  }
}
