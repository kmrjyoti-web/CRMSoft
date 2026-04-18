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
var PageRegistryBootstrapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageRegistryBootstrapService = void 0;
const common_1 = require("@nestjs/common");
const page_scanner_service_1 = require("./page-scanner.service");
let PageRegistryBootstrapService = PageRegistryBootstrapService_1 = class PageRegistryBootstrapService {
    constructor(scanner) {
        this.scanner = scanner;
        this.logger = new common_1.Logger(PageRegistryBootstrapService_1.name);
    }
    onApplicationBootstrap() {
        this.scanner
            .scanAndRegister()
            .then((result) => {
            this.logger.log(`Page Registry: ${result.total} pages (${result.created} new, ${result.updated} updated)`);
        })
            .catch((err) => {
            this.logger.error('Page Registry scan failed', err);
        });
    }
};
exports.PageRegistryBootstrapService = PageRegistryBootstrapService;
exports.PageRegistryBootstrapService = PageRegistryBootstrapService = PageRegistryBootstrapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [page_scanner_service_1.PageScannerService])
], PageRegistryBootstrapService);
//# sourceMappingURL=page-registry-bootstrap.service.js.map