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
var GetFolderContentsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFolderContentsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_folder_contents_query_1 = require("./get-folder-contents.query");
const folder_service_1 = require("../../../services/folder.service");
let GetFolderContentsHandler = GetFolderContentsHandler_1 = class GetFolderContentsHandler {
    constructor(folderService) {
        this.folderService = folderService;
        this.logger = new common_1.Logger(GetFolderContentsHandler_1.name);
    }
    async execute(query) {
        try {
            return this.folderService.getContents(query.folderId, query.page, query.limit);
        }
        catch (error) {
            this.logger.error(`GetFolderContentsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetFolderContentsHandler = GetFolderContentsHandler;
exports.GetFolderContentsHandler = GetFolderContentsHandler = GetFolderContentsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_folder_contents_query_1.GetFolderContentsQuery),
    __metadata("design:paramtypes", [folder_service_1.FolderService])
], GetFolderContentsHandler);
//# sourceMappingURL=get-folder-contents.handler.js.map