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
var CreateSuperAdminHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSuperAdminHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const create_super_admin_command_1 = require("./create-super-admin.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let CreateSuperAdminHandler = CreateSuperAdminHandler_1 = class CreateSuperAdminHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateSuperAdminHandler_1.name);
    }
    async execute(command) {
        try {
            const hashedPassword = await bcrypt.hash(command.password, 12);
            const superAdmin = await this.prisma.identity.superAdmin.create({
                data: {
                    email: command.email,
                    password: hashedPassword,
                    firstName: command.firstName,
                    lastName: command.lastName,
                },
            });
            this.logger.log(`Super admin created: ${superAdmin.id} (${command.email})`);
            return superAdmin;
        }
        catch (error) {
            this.logger.error(`CreateSuperAdminHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateSuperAdminHandler = CreateSuperAdminHandler;
exports.CreateSuperAdminHandler = CreateSuperAdminHandler = CreateSuperAdminHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_super_admin_command_1.CreateSuperAdminCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateSuperAdminHandler);
//# sourceMappingURL=create-super-admin.handler.js.map