"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMUNICATION_REPOSITORY = exports.CommunicationEntity = exports.CommunicationsModule = void 0;
var communications_module_1 = require("./communications.module");
Object.defineProperty(exports, "CommunicationsModule", { enumerable: true, get: function () { return communications_module_1.CommunicationsModule; } });
var communication_entity_1 = require("./domain/entities/communication.entity");
Object.defineProperty(exports, "CommunicationEntity", { enumerable: true, get: function () { return communication_entity_1.CommunicationEntity; } });
var communication_repository_interface_1 = require("./domain/interfaces/communication-repository.interface");
Object.defineProperty(exports, "COMMUNICATION_REPOSITORY", { enumerable: true, get: function () { return communication_repository_interface_1.COMMUNICATION_REPOSITORY; } });
//# sourceMappingURL=index.js.map