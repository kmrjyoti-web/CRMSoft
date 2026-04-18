"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORGANIZATION_REPOSITORY = exports.OrganizationEntity = exports.OrganizationsModule = void 0;
var organizations_module_1 = require("./organizations.module");
Object.defineProperty(exports, "OrganizationsModule", { enumerable: true, get: function () { return organizations_module_1.OrganizationsModule; } });
var organization_entity_1 = require("./domain/entities/organization.entity");
Object.defineProperty(exports, "OrganizationEntity", { enumerable: true, get: function () { return organization_entity_1.OrganizationEntity; } });
var organization_repository_interface_1 = require("./domain/interfaces/organization-repository.interface");
Object.defineProperty(exports, "ORGANIZATION_REPOSITORY", { enumerable: true, get: function () { return organization_repository_interface_1.ORGANIZATION_REPOSITORY; } });
//# sourceMappingURL=index.js.map