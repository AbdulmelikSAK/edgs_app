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
exports.TrucksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const trucks_service_1 = require("./trucks.service");
const create_truck_dto_1 = require("./dto/create-truck.dto");
const update_truck_dto_1 = require("./dto/update-truck.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TrucksController = class TrucksController {
    trucksService;
    constructor(trucksService) {
        this.trucksService = trucksService;
    }
    create(dto) {
        return this.trucksService.create(dto);
    }
    findAll() {
        return this.trucksService.findAll();
    }
    getLowStock() {
        return this.trucksService.getLowStockTrucks();
    }
    findOne(id) {
        return this.trucksService.findOne(id);
    }
    update(id, dto) {
        return this.trucksService.update(id, dto);
    }
    remove(id) {
        return this.trucksService.remove(id);
    }
};
exports.TrucksController = TrucksController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un camion' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_truck_dto_1.CreateTruckDto]),
    __metadata("design:returntype", void 0)
], TrucksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des camions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrucksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    (0, swagger_1.ApiOperation)({ summary: 'Camions avec stock faible' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrucksController.prototype, "getLowStock", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrucksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_truck_dto_1.UpdateTruckDto]),
    __metadata("design:returntype", void 0)
], TrucksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrucksController.prototype, "remove", null);
exports.TrucksController = TrucksController = __decorate([
    (0, swagger_1.ApiTags)('trucks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('trucks'),
    __metadata("design:paramtypes", [trucks_service_1.TrucksService])
], TrucksController);
//# sourceMappingURL=trucks.controller.js.map