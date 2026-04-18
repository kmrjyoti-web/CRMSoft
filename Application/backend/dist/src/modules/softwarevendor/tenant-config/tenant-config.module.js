"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantConfigModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const encryption_service_1 = require("./services/encryption.service");
const credential_schema_service_1 = require("./services/credential-schema.service");
const tenant_config_service_1 = require("./services/tenant-config.service");
const config_seeder_service_1 = require("./services/config-seeder.service");
const credential_service_1 = require("./services/credential.service");
const credential_verifier_service_1 = require("./services/credential-verifier.service");
const token_refresher_service_1 = require("./services/token-refresher.service");
const config_controller_1 = require("./presentation/config.controller");
const credential_controller_1 = require("./presentation/credential.controller");
const credential_admin_controller_1 = require("./presentation/credential-admin.controller");
let TenantConfigModule = class TenantConfigModule {
};
exports.TenantConfigModule = TenantConfigModule;
exports.TenantConfigModule = TenantConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule],
        controllers: [config_controller_1.ConfigController, credential_controller_1.CredentialController, credential_admin_controller_1.CredentialAdminController],
        providers: [
            encryption_service_1.EncryptionService,
            credential_schema_service_1.CredentialSchemaService,
            tenant_config_service_1.TenantConfigService,
            config_seeder_service_1.ConfigSeederService,
            credential_service_1.CredentialService,
            credential_verifier_service_1.CredentialVerifierService,
            token_refresher_service_1.TokenRefresherService,
        ],
        exports: [tenant_config_service_1.TenantConfigService, credential_service_1.CredentialService, encryption_service_1.EncryptionService],
    })
], TenantConfigModule);
//# sourceMappingURL=tenant-config.module.js.map