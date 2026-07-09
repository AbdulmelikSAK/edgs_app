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
exports.StockService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stock_movement_entity_1 = require("../database/entities/stock-movement.entity");
const truck_entity_1 = require("../database/entities/truck.entity");
const mission_entity_1 = require("../database/entities/mission.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
let StockService = class StockService {
    stockRepo;
    truckRepo;
    missionRepo;
    employeeRepo;
    constructor(stockRepo, truckRepo, missionRepo, employeeRepo) {
        this.stockRepo = stockRepo;
        this.truckRepo = truckRepo;
        this.missionRepo = missionRepo;
        this.employeeRepo = employeeRepo;
    }
    async createMovement(dto) {
        const truck = await this.truckRepo.findOne({ where: { id: dto.truckId } });
        if (!truck)
            throw new common_1.NotFoundException('Camion non trouvé');
        const mission = dto.missionId ? await this.missionRepo.findOne({ where: { id: dto.missionId } }) : null;
        const employee = dto.employeeId ? await this.employeeRepo.findOne({ where: { id: dto.employeeId } }) : null;
        const stockBefore = truck.currentStock;
        let stockAfter = stockBefore;
        if (dto.type === stock_movement_entity_1.StockMovementType.LOAD || dto.type === stock_movement_entity_1.StockMovementType.ADJUSTMENT) {
            stockAfter = stockBefore + dto.quantity;
        }
        else if (dto.type === stock_movement_entity_1.StockMovementType.CONSUME || dto.type === stock_movement_entity_1.StockMovementType.RETURN) {
            stockAfter = stockBefore - Math.abs(dto.quantity);
        }
        if (stockAfter < 0)
            throw new common_1.BadRequestException('Stock insuffisant');
        truck.currentStock = stockAfter;
        await this.truckRepo.save(truck);
        const movement = this.stockRepo.create({
            truck,
            mission: mission ?? undefined,
            employee: employee ?? undefined,
            type: dto.type,
            quantity: dto.quantity,
            stockBefore,
            stockAfter,
            notes: dto.notes,
        });
        await this.stockRepo.save(movement);
        const alert = stockAfter <= truck.stockAlertThreshold;
        return { movement, alert, currentStock: stockAfter };
    }
    findByTruck(truckId) {
        return this.stockRepo.find({
            where: { truck: { id: truckId } },
            relations: { mission: true, employee: true },
            order: { createdAt: 'DESC' },
            take: 100,
        });
    }
    findByMission(missionId) {
        return this.stockRepo.find({
            where: { mission: { id: missionId } },
            relations: { truck: true, employee: true },
            order: { createdAt: 'ASC' },
        });
    }
};
exports.StockService = StockService;
exports.StockService = StockService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(stock_movement_entity_1.StockMovement)),
    __param(1, (0, typeorm_1.InjectRepository)(truck_entity_1.Truck)),
    __param(2, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __param(3, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StockService);
//# sourceMappingURL=stock.service.js.map