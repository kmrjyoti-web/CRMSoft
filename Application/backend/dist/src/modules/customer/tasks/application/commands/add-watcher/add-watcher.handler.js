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
var AddWatcherHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddWatcherHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const add_watcher_command_1 = require("./add-watcher.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const cross_db_resolver_service_1 = require("../../../../../../core/prisma/cross-db-resolver.service");
const common_1 = require("@nestjs/common");
let AddWatcherHandler = AddWatcherHandler_1 = class AddWatcherHandler {
    constructor(prisma, resolver) {
        this.prisma = prisma;
        this.resolver = resolver;
        this.logger = new common_1.Logger(AddWatcherHandler_1.name);
    }
    async execute(cmd) {
        try {
            const task = await this.prisma.working.task.findUnique({ where: { id: cmd.taskId } });
            if (!task || !task.isActive)
                throw new common_1.NotFoundException('Task not found');
            const existing = await this.prisma.working.taskWatcher.findUnique({
                where: { taskId_userId: { taskId: cmd.taskId, userId: cmd.watcherUserId } },
            });
            if (existing)
                throw new common_1.ConflictException('User is already watching this task');
            const watcher = await this.prisma.working.taskWatcher.create({
                data: { taskId: cmd.taskId, userId: cmd.watcherUserId },
            });
            const user = await this.resolver.resolveUser(watcher.userId);
            return { ...watcher, user };
        }
        catch (error) {
            this.logger.error(`AddWatcherHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AddWatcherHandler = AddWatcherHandler;
exports.AddWatcherHandler = AddWatcherHandler = AddWatcherHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(add_watcher_command_1.AddWatcherCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cross_db_resolver_service_1.CrossDbResolverService])
], AddWatcherHandler);
//# sourceMappingURL=add-watcher.handler.js.map