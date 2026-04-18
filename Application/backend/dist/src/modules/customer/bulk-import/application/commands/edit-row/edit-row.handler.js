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
var EditRowHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditRowHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const edit_row_command_1 = require("./edit-row.command");
let EditRowHandler = EditRowHandler_1 = class EditRowHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(EditRowHandler_1.name);
    }
    async execute(cmd) {
        try {
            return this.prisma.working.importRow.update({
                where: { id: cmd.rowId },
                data: { userEditedData: cmd.editedData },
            });
        }
        catch (error) {
            this.logger.error(`EditRowHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.EditRowHandler = EditRowHandler;
exports.EditRowHandler = EditRowHandler = EditRowHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(edit_row_command_1.EditRowCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EditRowHandler);
//# sourceMappingURL=edit-row.handler.js.map