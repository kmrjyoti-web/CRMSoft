"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEvent = exports.AggregateRoot = exports.BaseEntity = void 0;
var base_entity_1 = require("./base.entity");
Object.defineProperty(exports, "BaseEntity", { enumerable: true, get: function () { return base_entity_1.BaseEntity; } });
var aggregate_root_1 = require("./aggregate-root");
Object.defineProperty(exports, "AggregateRoot", { enumerable: true, get: function () { return aggregate_root_1.AggregateRoot; } });
var domain_event_1 = require("./domain-event");
Object.defineProperty(exports, "DomainEvent", { enumerable: true, get: function () { return domain_event_1.DomainEvent; } });
__exportStar(require("./value-objects"), exports);
//# sourceMappingURL=index.js.map