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
var UpdateFolderHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFolderHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_folder_command_1 = require("./update-folder.command");
const folder_service_1 = require("../../../services/folder.service");
let UpdateFolderHandler = UpdateFolderHandler_1 = class UpdateFolderHandler {
    constructor(folderService) {
        this.folderService = folderService;
        this.logger = new common_1.Logger(UpdateFolderHandler_1.name);
    }
    async execute(command) {
        try {
            return this.folderService.update(command.id, {
                name: command.name,
                description: command.description,
                color: command.color,
                icon: command.icon,
            });
        }
        catch (error) {
            this.logger.error(`UpdateFolderHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateFolderHandler = UpdateFolderHandler;
exports.UpdateFolderHandler = UpdateFolderHandler = UpdateFolderHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_folder_command_1.UpdateFolderCommand),
    __metadata("design:paramtypes", [folder_service_1.FolderService])
], UpdateFolderHandler);
//# sourceMappingURL=update-folder.handler.js.map