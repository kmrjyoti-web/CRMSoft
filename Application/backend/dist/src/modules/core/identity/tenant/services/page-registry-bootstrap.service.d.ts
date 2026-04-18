import { OnApplicationBootstrap } from '@nestjs/common';
import { PageScannerService } from './page-scanner.service';
export declare class PageRegistryBootstrapService implements OnApplicationBootstrap {
    private readonly scanner;
    private readonly logger;
    constructor(scanner: PageScannerService);
    onApplicationBootstrap(): void;
}
