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
var PlatformConsolePrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformConsolePrismaService = void 0;
const common_1 = require("@nestjs/common");
const platform_console_client_1 = require(".prisma/platform-console-client");
let PlatformConsolePrismaService = PlatformConsolePrismaService_1 = class PlatformConsolePrismaService extends platform_console_client_1.PrismaClient {
    constructor() {
        super({
            datasources: {
                db: { url: process.env.PLATFORM_CONSOLE_DATABASE_URL },
            },
        });
        this.logger = new common_1.Logger(PlatformConsolePrismaService_1.name);
    }
    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('PlatformConsoleDB connected');
        }
        catch (error) {
            this.logger.error('PlatformConsoleDB connection failed', error.stack);
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.PlatformConsolePrismaService = PlatformConsolePrismaService;
exports.PlatformConsolePrismaService = PlatformConsolePrismaService = PlatformConsolePrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PlatformConsolePrismaService);
//# sourceMappingURL=platform-console-prisma.service.js.map