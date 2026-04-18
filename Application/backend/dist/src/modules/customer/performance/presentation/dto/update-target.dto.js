"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTargetDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_target_dto_1 = require("./create-target.dto");
class UpdateTargetDto extends (0, mapped_types_1.PartialType)(create_target_dto_1.CreateTargetDto) {
}
exports.UpdateTargetDto = UpdateTargetDto;
//# sourceMappingURL=update-target.dto.js.map