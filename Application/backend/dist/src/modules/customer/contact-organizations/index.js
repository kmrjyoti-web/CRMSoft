"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTACT_ORG_REPOSITORY = exports.ContactOrganizationEntity = exports.ContactOrganizationsModule = void 0;
var contact_organizations_module_1 = require("./contact-organizations.module");
Object.defineProperty(exports, "ContactOrganizationsModule", { enumerable: true, get: function () { return contact_organizations_module_1.ContactOrganizationsModule; } });
var contact_organization_entity_1 = require("./domain/entities/contact-organization.entity");
Object.defineProperty(exports, "ContactOrganizationEntity", { enumerable: true, get: function () { return contact_organization_entity_1.ContactOrganizationEntity; } });
var contact_org_repository_interface_1 = require("./domain/interfaces/contact-org-repository.interface");
Object.defineProperty(exports, "CONTACT_ORG_REPOSITORY", { enumerable: true, get: function () { return contact_org_repository_interface_1.CONTACT_ORG_REPOSITORY; } });
//# sourceMappingURL=index.js.map