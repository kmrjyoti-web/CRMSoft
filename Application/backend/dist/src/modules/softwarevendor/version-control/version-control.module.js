"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionControlModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const prisma_module_1 = require("../../../core/prisma/prisma.module");
const version_control_controller_1 = require("./presentation/version-control.controller");
const create_version_handler_1 = require("./application/handlers/create-version.handler");
const publish_version_handler_1 = require("./application/handlers/publish-version.handler");
const rollback_version_handler_1 = require("./application/handlers/rollback-version.handler");
const create_patch_handler_1 = require("./application/handlers/create-patch.handler");
const list_versions_handler_1 = require("./application/handlers/list-versions.handler");
const get_version_handler_1 = require("./application/handlers/get-version.handler");
const CommandHandlers = [
    create_version_handler_1.CreateVersionHandler,
    publish_version_handler_1.PublishVersionHandler,
    rollback_version_handler_1.RollbackVersionHandler,
    create_patch_handler_1.CreatePatchHandler,
];
const QueryHandlers = [
    list_versions_handler_1.ListVersionsHandler,
    get_version_handler_1.GetVersionHandler,
    get_version_handler_1.GetCurrentVersionHandler,
];
let VersionControlModule = class VersionControlModule {
};
exports.VersionControlModule = VersionControlModule;
exports.VersionControlModule = VersionControlModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule, prisma_module_1.PrismaModule],
        controllers: [version_control_controller_1.VersionControlController],
        providers: [...CommandHandlers, ...QueryHandlers],
    })
], VersionControlModule);
//# sourceMappingURL=version-control.module.js.map