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
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const mission_entity_1 = require("../database/entities/mission.entity");
const time_entry_entity_1 = require("../database/entities/time-entry.entity");
const stock_movement_entity_1 = require("../database/entities/stock-movement.entity");
const truck_entity_1 = require("../database/entities/truck.entity");
let StatsService = class StatsService {
    missionRepo;
    timeRepo;
    stockRepo;
    truckRepo;
    constructor(missionRepo, timeRepo, stockRepo, truckRepo) {
        this.missionRepo = missionRepo;
        this.timeRepo = timeRepo;
        this.stockRepo = stockRepo;
        this.truckRepo = truckRepo;
    }
    async getGlobalStats(from, to) {
        const where = {};
        if (from && to)
            where.scheduledDate = (0, typeorm_2.Between)(new Date(from), new Date(to));
        const missions = await this.missionRepo.find({ where });
        const completed = missions.filter(m => m.status === mission_entity_1.MissionStatus.COMPLETED);
        const totalRevenue = completed.reduce((sum, m) => sum + (Number(m.actualPrice) || 0), 0);
        const totalEstimated = completed.reduce((sum, m) => sum + (Number(m.estimatedPrice) || 0), 0);
        const totalSurface = completed.reduce((sum, m) => sum + (Number(m.surfaceArea) || 0), 0);
        const totalFuel = completed.reduce((sum, m) => sum + (Number(m.fuelConsumption) || 0), 0);
        const totalSandBags = completed.reduce((sum, m) => sum + (m.sandBagsUsed || 0), 0);
        const trucks = await this.truckRepo.find({ where: { isActive: true } });
        return {
            missions: {
                total: missions.length,
                completed: completed.length,
                inProgress: missions.filter(m => m.status === mission_entity_1.MissionStatus.IN_PROGRESS).length,
                planned: missions.filter(m => m.status === mission_entity_1.MissionStatus.PLANNED).length,
                cancelled: missions.filter(m => m.status === mission_entity_1.MissionStatus.CANCELLED).length,
            },
            financial: {
                totalRevenue,
                totalEstimated,
                profitability: totalEstimated > 0 ? ((totalRevenue / totalEstimated) * 100).toFixed(1) + '%' : 'N/A',
            },
            operational: {
                totalSurfaceArea: totalSurface,
                totalFuelConsumption: totalFuel,
                totalSandBagsUsed: totalSandBags,
                activeTrucks: trucks.length,
            },
        };
    }
    async getTruckStats(truckId) {
        const missions = await this.missionRepo.find({ where: { truck: { id: truckId } } });
        const stockMovements = await this.stockRepo.find({ where: { truck: { id: truckId } } });
        const totalConsumed = stockMovements
            .filter(s => s.type === stock_movement_entity_1.StockMovementType.CONSUME)
            .reduce((sum, s) => sum + s.quantity, 0);
        return {
            missions: missions.length,
            completed: missions.filter(m => m.status === mission_entity_1.MissionStatus.COMPLETED).length,
            totalRevenue: missions.reduce((s, m) => s + (Number(m.actualPrice) || 0), 0),
            totalSurface: missions.reduce((s, m) => s + (Number(m.surfaceArea) || 0), 0),
            sandBagsConsumed: totalConsumed,
        };
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __param(1, (0, typeorm_1.InjectRepository)(time_entry_entity_1.TimeEntry)),
    __param(2, (0, typeorm_1.InjectRepository)(stock_movement_entity_1.StockMovement)),
    __param(3, (0, typeorm_1.InjectRepository)(truck_entity_1.Truck)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StatsService);
//# sourceMappingURL=stats.service.js.map