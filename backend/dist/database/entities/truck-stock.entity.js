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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TruckStock = void 0;
const typeorm_1 = require("typeorm");
const truck_entity_1 = require("./truck.entity");
const stock_item_entity_1 = require("./stock-item.entity");
let TruckStock = class TruckStock {
    id;
    truck;
    stockItem;
    quantity;
    createdAt;
    updatedAt;
};
exports.TruckStock = TruckStock;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TruckStock.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => truck_entity_1.Truck, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", truck_entity_1.Truck)
], TruckStock.prototype, "truck", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => stock_item_entity_1.StockItem, { onDelete: 'CASCADE', eager: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", stock_item_entity_1.StockItem)
], TruckStock.prototype, "stockItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TruckStock.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TruckStock.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TruckStock.prototype, "updatedAt", void 0);
exports.TruckStock = TruckStock = __decorate([
    (0, typeorm_1.Entity)('truck_stocks')
], TruckStock);
//# sourceMappingURL=truck-stock.entity.js.map