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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stock_service_1 = require("./stock.service");
const create_stock_movement_dto_1 = require("./dto/create-stock-movement.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let StockController = class StockController {
    stockService;
    constructor(stockService) {
        this.stockService = stockService;
    }
    createMovement(dto) {
        return this.stockService.createMovement(dto);
    }
    findByTruck(truckId) {
        return this.stockService.findByTruck(truckId);
    }
    findByMission(missionId) {
        return this.stockService.findByMission(missionId);
    }
};
exports.StockController = StockController;
__decorate([
    (0, common_1.Post)('movement'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_movement_dto_1.CreateStockMovementDto]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "createMovement", null);
__decorate([
    (0, common_1.Get)('truck/:truckId'),
    __param(0, (0, common_1.Param)('truckId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "findByTruck", null);
__decorate([
    (0, common_1.Get)('mission/:missionId'),
    __param(0, (0, common_1.Param)('missionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "findByMission", null);
exports.StockController = StockController = __decorate([
    (0, swagger_1.ApiTags)('stock'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('stock'),
    __metadata("design:paramtypes", [stock_service_1.StockService])
], StockController);
//# sourceMappingURL=stock.controller.js.map