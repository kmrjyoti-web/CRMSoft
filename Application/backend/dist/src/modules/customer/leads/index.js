"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEAD_REPOSITORY = exports.LeadEntity = exports.LeadsModule = void 0;
var leads_module_1 = require("./leads.module");
Object.defineProperty(exports, "LeadsModule", { enumerable: true, get: function () { return leads_module_1.LeadsModule; } });
var lead_entity_1 = require("./domain/entities/lead.entity");
Object.defineProperty(exports, "LeadEntity", { enumerable: true, get: function () { return lead_entity_1.LeadEntity; } });
var lead_repository_interface_1 = require("./domain/interfaces/lead-repository.interface");
Object.defineProperty(exports, "LEAD_REPOSITORY", { enumerable: true, get: function () { return lead_repository_interface_1.LEAD_REPOSITORY; } });
//# sourceMappingURL=index.js.map