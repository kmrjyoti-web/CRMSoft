"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RemoveWatcherHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveWatcherHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const remove_watcher_command_1 = require("./remove-watcher.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const common_1 = require("@nestjs/common");
let RemoveWatcherHandler = RemoveWatcherHandler_1 = class RemoveWatcherHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RemoveWatcherHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.taskWatcher.findUnique({
                where: { taskId_userId: { taskId: cmd.taskId, userId: cmd.watcherUserId } },
            });
            if (!existing)
                throw new common_1.NotFoundException('Watcher not found');
            return this.prisma.working.taskWatcher.delete({
                where: { taskId_userId: { taskId: cmd.taskId, userId: cmd.watcherUserId } },
            });
        }
        catch (error) {
            this.logger.error(`RemoveWatcherHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RemoveWatcherHandler = RemoveWatcherHandler;
exports.RemoveWatcherHandler = RemoveWatcherHandler = RemoveWatcherHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(remove_watcher_command_1.RemoveWatcherCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RemoveWatcherHandler);
//# sourceMappingURL=remove-watcher.handler.js.map