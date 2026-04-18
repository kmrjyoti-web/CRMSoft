"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTACT_REPOSITORY = exports.ContactEntity = exports.ContactsModule = void 0;
var contacts_module_1 = require("./contacts.module");
Object.defineProperty(exports, "ContactsModule", { enumerable: true, get: function () { return contacts_module_1.ContactsModule; } });
var contact_entity_1 = require("./domain/entities/contact.entity");
Object.defineProperty(exports, "ContactEntity", { enumerable: true, get: function () { return contact_entity_1.ContactEntity; } });
var contact_repository_interface_1 = require("./domain/interfaces/contact-repository.interface");
Object.defineProperty(exports, "CONTACT_REPOSITORY", { enumerable: true, get: function () { return contact_repository_interface_1.CONTACT_REPOSITORY; } });
//# sourceMappingURL=index.js.map