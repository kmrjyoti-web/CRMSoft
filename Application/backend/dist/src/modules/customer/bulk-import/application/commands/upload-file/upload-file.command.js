"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFileCommand = void 0;
class UploadFileCommand {
    constructor(fileName, fileType, fileSize, buffer, targetEntity, createdById, createdByName) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.buffer = buffer;
        this.targetEntity = targetEntity;
        this.createdById = createdById;
        this.createdByName = createdByName;
    }
}
exports.UploadFileCommand = UploadFileCommand;
//# sourceMappingURL=upload-file.command.js.map