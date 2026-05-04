import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PageScannerService } from './page-scanner.service';

@Injectable()
export class PageRegistryBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PageRegistryBootstrapService.name);

  constructor(private readonly scanner: PageScannerService) {}

  onApplicationBootstrap() {
    // Run in background so it doesn't block startup
    this.scanner
      .scanAndRegister()
      .then((result) => {
        this.logger.log(
          `Page Registry: ${result.total} pages (${result.created} new, ${result.updated} updated)`,
        );
      })
      .catch((err) => {
        this.logger.error('Page Registry scan failed', err);
      });
  }
}
