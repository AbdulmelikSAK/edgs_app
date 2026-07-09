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
exports.StockMovement = exports.StockMovementType = void 0;
const typeorm_1 = require("typeorm");
const truck_entity_1 = require("./truck.entity");
const mission_entity_1 = require("./mission.entity");
const employee_entity_1 = require("./employee.entity");
var StockMovementType;
(function (StockMovementType) {
    StockMovementType["LOAD"] = "load";
    StockMovementType["CONSUME"] = "consume";
    StockMovementType["RETURN"] = "return";
    StockMovementType["ADJUSTMENT"] = "adjustment";
})(StockMovementType || (exports.StockMovementType = StockMovementType = {}));
let StockMovement = class StockMovement {
    id;
    truck;
    mission;
    employee;
    type;
    quantity;
    stockBefore;
    stockAfter;
    notes;
    createdAt;
};
exports.StockMovement = StockMovement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StockMovement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => truck_entity_1.Truck),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", truck_entity_1.Truck)
], StockMovement.prototype, "truck", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => mission_entity_1.Mission, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", mission_entity_1.Mission)
], StockMovement.prototype, "mission", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", employee_entity_1.Employee)
], StockMovement.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StockMovementType }),
    __metadata("design:type", String)
], StockMovement.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], StockMovement.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], StockMovement.prototype, "stockBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], StockMovement.prototype, "stockAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], StockMovement.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StockMovement.prototype, "createdAt", void 0);
exports.StockMovement = StockMovement = __decorate([
    (0, typeorm_1.Entity)('stock_movements')
], StockMovement);
//# sourceMappingURL=stock-movement.entity.js.map