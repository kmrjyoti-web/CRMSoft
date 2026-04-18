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
var DeleteFolderHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteFolderHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_folder_command_1 = require("./delete-folder.command");
const folder_service_1 = require("../../../services/folder.service");
let DeleteFolderHandler = DeleteFolderHandler_1 = class DeleteFolderHandler {
    constructor(folderService) {
        this.folderService = folderService;
        this.logger = new common_1.Logger(DeleteFolderHandler_1.name);
    }
    async execute(command) {
        try {
            await this.folderService.softDelete(command.id);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`DeleteFolderHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeleteFolderHandler = DeleteFolderHandler;
exports.DeleteFolderHandler = DeleteFolderHandler = DeleteFolderHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(delete_folder_command_1.DeleteFolderCommand),
    __metadata("design:paramtypes", [folder_service_1.FolderService])
], DeleteFolderHandler);
//# sourceMappingURL=delete-folder.handler.js.map