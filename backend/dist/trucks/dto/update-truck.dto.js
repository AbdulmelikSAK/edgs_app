"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTruckDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_truck_dto_1 = require("./create-truck.dto");
class UpdateTruckDto extends (0, swagger_1.PartialType)(create_truck_dto_1.CreateTruckDto) {
}
exports.UpdateTruckDto = UpdateTruckDto;
//# sourceMappingURL=update-truck.dto.js.map