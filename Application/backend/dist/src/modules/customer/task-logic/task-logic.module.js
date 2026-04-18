"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskLogicModule = void 0;
const common_1 = require("@nestjs/common");
const task_logic_controller_1 = require("./presentation/task-logic.controller");
const task_logic_service_1 = require("./task-logic.service");
let TaskLogicModule = class TaskLogicModule {
};
exports.TaskLogicModule = TaskLogicModule;
exports.TaskLogicModule = TaskLogicModule = __decorate([
    (0, common_1.Module)({
        controllers: [task_logic_controller_1.TaskLogicController],
        providers: [task_logic_service_1.TaskLogicService],
        exports: [task_logic_service_1.TaskLogicService],
    })
], TaskLogicModule);
//# sourceMappingURL=task-logic.module.js.map