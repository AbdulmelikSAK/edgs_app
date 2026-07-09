"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWorksiteDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_worksite_dto_1 = require("./create-worksite.dto");
class UpdateWorksiteDto extends (0, swagger_1.PartialType)(create_worksite_dto_1.CreateWorksiteDto) {
}
exports.UpdateWorksiteDto = UpdateWorksiteDto;
//# sourceMappingURL=update-worksite.dto.js.map