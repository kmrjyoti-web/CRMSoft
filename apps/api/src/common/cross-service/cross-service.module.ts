/**
 * CrossServiceModule
 *
 * @Global module that provides IIdentityService and IVendorService to the entire app.
 *
 * Today (monolith): both tokens resolve to direct Prisma implementations.
 * At extraction:
 *   1. Remove PrismaModule dependency from the extracted service.
 *   2. Swap useClass from *Monolith to *HttpClient (or *GrpcClient).
 *   3. The rest of the app stays unchanged.
 *
 * Register once in AppModule — do not import in individual feature modules.
 *
 * Usage in feature services:
 *   constructor(
 *     @Inject(IDENTITY_SERVICE) private readonly identityService: IIdentityService,
 *     @Inject(VENDOR_SERVICE)   private readonly vendorService:   IVendorService,
 *   ) {}
 */

import { Global, Module } from '@nestjs/common';
import { IDENTITY_SERVICE } from './interfaces/identity-service.interface';
import { VENDOR_SERVICE } from './interfaces/vendor-service.interface';
import { IdentityServiceMonolith } from './monolith/identity-service.monolith';
import { VendorServiceMonolith } from './monolith/vendor-service.monolith';

@Global()
@Module({
  providers: [
    { provide: IDENTITY_SERVICE, useClass: IdentityServiceMonolith },
    { provide: VENDOR_SERVICE,   useClass: VendorServiceMonolith },
  ],
  exports: [IDENTITY_SERVICE, VENDOR_SERVICE],
})
export class CrossServiceModule {}
