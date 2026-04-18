"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PluginHandlerRegistry_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginHandlerRegistry = void 0;
const common_1 = require("@nestjs/common");
let PluginHandlerRegistry = PluginHandlerRegistry_1 = class PluginHandlerRegistry {
    constructor() {
        this.logger = new common_1.Logger(PluginHandlerRegistry_1.name);
        this.handlers = new Map();
    }
    register(handler) {
        this.handlers.set(handler.pluginCode, handler);
        this.logger.log(`Registered plugin handler: ${handler.pluginCode}`);
    }
    get(pluginCode) {
        return this.handlers.get(pluginCode);
    }
    has(pluginCode) {
        return this.handlers.has(pluginCode);
    }
    getAll() {
        return this.handlers;
    }
    getCodes() {
        return Array.from(this.handlers.keys());
    }
};
exports.PluginHandlerRegistry = PluginHandlerRegistry;
exports.PluginHandlerRegistry = PluginHandlerRegistry = PluginHandlerRegistry_1 = __decorate([
    (0, common_1.Injectable)()
], PluginHandlerRegistry);
//# sourceMappingURL=handler-registry.js.map