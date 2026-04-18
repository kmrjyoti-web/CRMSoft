"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSavedFilterDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_saved_filter_dto_1 = require("./create-saved-filter.dto");
class UpdateSavedFilterDto extends (0, mapped_types_1.PartialType)(create_saved_filter_dto_1.CreateSavedFilterDto) {
}
exports.UpdateSavedFilterDto = UpdateSavedFilterDto;
//# sourceMappingURL=update-saved-filter.dto.js.map