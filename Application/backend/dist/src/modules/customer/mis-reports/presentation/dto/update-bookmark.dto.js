"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBookmarkDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_bookmark_dto_1 = require("./create-bookmark.dto");
class UpdateBookmarkDto extends (0, swagger_1.PartialType)(create_bookmark_dto_1.CreateBookmarkDto) {
}
exports.UpdateBookmarkDto = UpdateBookmarkDto;
//# sourceMappingURL=update-bookmark.dto.js.map