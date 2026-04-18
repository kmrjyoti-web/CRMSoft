"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbAuditorModule = void 0;
const common_1 = require("@nestjs/common");
const db_auditor_controller_1 = require("./db-auditor.controller");
const db_auditor_service_1 = require("./db-auditor.service");
const naming_check_service_1 = require("./checks/naming-check.service");
const cross_db_include_check_service_1 = require("./checks/cross-db-include-check.service");
const fk_orphan_check_service_1 = require("./checks/fk-orphan-check.service");
let DbAuditorModule = class DbAuditorModule {
};
exports.DbAuditorModule = DbAuditorModule;
exports.DbAuditorModule = DbAuditorModule = __decorate([
    (0, common_1.Module)({
        controllers: [db_auditor_controller_1.DbAuditorController],
        providers: [
            db_auditor_service_1.DbAuditorService,
            naming_check_service_1.NamingCheckService,
            cross_db_include_check_service_1.CrossDbIncludeCheckService,
            fk_orphan_check_service_1.FkOrphanCheckService,
        ],
        exports: [db_auditor_service_1.DbAuditorService],
    })
], DbAuditorModule);
//# sourceMappingURL=db-auditor.module.js.map