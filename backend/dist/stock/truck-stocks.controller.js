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
exports.TruckStocksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const truck_stock_entity_1 = require("../database/entities/truck-stock.entity");
const truck_entity_1 = require("../database/entities/truck.entity");
const stock_item_entity_1 = require("../database/entities/stock-item.entity");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TruckStocksController = class TruckStocksController {
    tsRepo;
    truckRepo;
    itemRepo;
    constructor(tsRepo, truckRepo, itemRepo) {
        this.tsRepo = tsRepo;
        this.truckRepo = truckRepo;
        this.itemRepo = itemRepo;
    }
    async findAll(res) {
        const list = await this.tsRepo.find({
            relations: { truck: true, stockItem: true },
            order: { truck: { plateNumber: 'ASC' } }
        });
        res.setHeader('Content-Range', `truck-stocks 0-${list.length}/${list.length}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
        return res.json(list);
    }
    findOne(id) {
        return this.tsRepo.findOne({
            where: { id },
            relations: { truck: true, stockItem: true }
        });
    }
    async create(body) {
        const truck = await this.truckRepo.findOneBy({ id: body.truckId });
        const stockItem = await this.itemRepo.findOneBy({ id: body.stockItemId });
        let ts = await this.tsRepo.findOne({
            where: { truck: { id: body.truckId }, stockItem: { id: body.stockItemId } }
        });
        if (ts) {
            ts.quantity = body.quantity;
        }
        else {
            ts = new truck_stock_entity_1.TruckStock();
            ts.truck = truck;
            ts.stockItem = stockItem;
            ts.quantity = body.quantity;
        }
        return this.tsRepo.save(ts);
    }
    async update(id, body) {
        await this.tsRepo.update(id, { quantity: body.quantity });
        return this.tsRepo.findOne({
            where: { id },
            relations: { truck: true, stockItem: true }
        });
    }
    async remove(id) {
        const ts = await this.tsRepo.findOneBy({ id });
        await this.tsRepo.delete(id);
        return ts;
    }
};
exports.TruckStocksController = TruckStocksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TruckStocksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TruckStocksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TruckStocksController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TruckStocksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TruckStocksController.prototype, "remove", null);
exports.TruckStocksController = TruckStocksController = __decorate([
    (0, swagger_1.ApiTags)('truck-stocks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('truck-stocks'),
    __param(0, (0, typeorm_1.InjectRepository)(truck_stock_entity_1.TruckStock)),
    __param(1, (0, typeorm_1.InjectRepository)(truck_entity_1.Truck)),
    __param(2, (0, typeorm_1.InjectRepository)(stock_item_entity_1.StockItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TruckStocksController);
//# sourceMappingURL=truck-stocks.controller.js.map