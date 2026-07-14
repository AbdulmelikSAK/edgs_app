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
const employee_entity_1 = require("../database/entities/employee.entity");
const production_entry_entity_1 = require("../database/entities/production-entry.entity");
const equipment_entity_1 = require("../database/entities/equipment.entity");
let StatsService = class StatsService {
    missionRepo;
    timeRepo;
    stockRepo;
    truckRepo;
    employeeRepo;
    productionRepo;
    equipmentRepo;
    constructor(missionRepo, timeRepo, stockRepo, truckRepo, employeeRepo, productionRepo, equipmentRepo) {
        this.missionRepo = missionRepo;
        this.timeRepo = timeRepo;
        this.stockRepo = stockRepo;
        this.truckRepo = truckRepo;
        this.employeeRepo = employeeRepo;
        this.productionRepo = productionRepo;
        this.equipmentRepo = equipmentRepo;
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
    async getDashboardStats() {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const employees = await this.employeeRepo.find({ where: { isActive: true } });
        const timeEntriesToday = await this.timeRepo.find({
            where: { timestamp: (0, typeorm_2.Between)(startOfToday, endOfToday) },
            relations: { employee: true },
        });
        const presentEmployeeIds = new Set();
        employees.forEach(emp => {
            const empEntries = timeEntriesToday
                .filter(t => t.employee.id === emp.id)
                .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            if (empEntries.length > 0) {
                const lastEntry = empEntries[empEntries.length - 1];
                if (lastEntry.type === time_entry_entity_1.TimeEntryType.DAY_START ||
                    lastEntry.type === time_entry_entity_1.TimeEntryType.PAUSE_END ||
                    lastEntry.type === time_entry_entity_1.TimeEntryType.MISSION_START) {
                    presentEmployeeIds.add(emp.id);
                }
            }
        });
        const activeMissions = await this.missionRepo.find({
            where: { status: mission_entity_1.MissionStatus.IN_PROGRESS },
            relations: { client: true, worksite: true },
        });
        let totalMinutesToday = 0;
        employees.forEach(emp => {
            const empEntries = timeEntriesToday
                .filter(t => t.employee.id === emp.id)
                .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            let clockedInTime = null;
            let totalEmpMs = 0;
            let pauseStartTime = null;
            let totalPauseMs = 0;
            empEntries.forEach(entry => {
                if (entry.type === time_entry_entity_1.TimeEntryType.DAY_START) {
                    clockedInTime = entry.timestamp;
                }
                else if (entry.type === time_entry_entity_1.TimeEntryType.DAY_END && clockedInTime) {
                    totalEmpMs += entry.timestamp.getTime() - clockedInTime.getTime();
                    clockedInTime = null;
                }
                else if (entry.type === time_entry_entity_1.TimeEntryType.PAUSE_START) {
                    pauseStartTime = entry.timestamp;
                }
                else if (entry.type === time_entry_entity_1.TimeEntryType.PAUSE_END && pauseStartTime) {
                    totalPauseMs += entry.timestamp.getTime() - pauseStartTime.getTime();
                    pauseStartTime = null;
                }
            });
            if (clockedInTime) {
                const limitTime = new Date().getTime() < endOfToday.getTime() ? new Date() : endOfToday;
                totalEmpMs += limitTime.getTime() - clockedInTime.getTime();
            }
            if (pauseStartTime) {
                const limitTime = new Date().getTime() < endOfToday.getTime() ? new Date() : endOfToday;
                totalPauseMs += limitTime.getTime() - pauseStartTime.getTime();
            }
            const workedMs = Math.max(0, totalEmpMs - totalPauseMs);
            totalMinutesToday += workedMs / (1000 * 60);
        });
        const hours = Math.floor(totalMinutesToday / 60);
        const mins = Math.round(totalMinutesToday % 60);
        const heuresPointéesStr = `${hours}h${mins.toString().padStart(2, '0')}`;
        const productionToday = await this.productionRepo.find({
            where: { date: (0, typeorm_2.Between)(startOfToday, endOfToday) },
        });
        const m2RealisesToday = productionToday.reduce((sum, p) => sum + Number(p.quantity), 0);
        const prodBreakdownByType = {};
        productionToday.forEach(p => {
            const type = p.prestationType || 'Autre';
            prodBreakdownByType[type] = (prodBreakdownByType[type] || 0) + Number(p.quantity);
        });
        const breakdown = Object.keys(prodBreakdownByType).map(name => {
            const quantity = prodBreakdownByType[name];
            return {
                name,
                quantity,
                percentage: m2RealisesToday > 0 ? Math.round((quantity / m2RealisesToday) * 100) : 0,
            };
        });
        const allMissions = await this.missionRepo.find({
            relations: { client: true, worksite: true },
        });
        const avancementChantiers = await Promise.all(allMissions.map(async (m) => {
            const prod = await this.productionRepo.find({ where: { mission: { id: m.id } } });
            const totalRealised = prod.reduce((sum, p) => sum + Number(p.quantity), 0);
            const totalPlanned = Number(m.surfaceArea) || 350;
            const percentage = Math.min(100, Math.round((totalRealised / totalPlanned) * 100));
            return {
                id: m.id,
                title: m.title,
                clientName: m.clientName || (m.client ? m.client.name : 'Client'),
                percentage,
                planned: totalPlanned,
                realised: totalRealised,
            };
        }));
        const trucks = await this.truckRepo.find({ where: { isActive: true } });
        const equipments = await this.equipmentRepo.find();
        const alertes = [];
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const fifteenDaysFromNow = new Date();
        fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);
        trucks.forEach(t => {
            if (t.controlTechniqueDate && new Date(t.controlTechniqueDate) <= thirtyDaysFromNow) {
                alertes.push({
                    type: 'vehicle_ct',
                    message: `Contrôle technique requis pour le camion ${t.plateNumber} (${t.model}) sous 30 jours`,
                    severity: 'warning',
                });
            }
            if (t.insuranceExpirationDate && new Date(t.insuranceExpirationDate) <= thirtyDaysFromNow) {
                alertes.push({
                    type: 'vehicle_insurance',
                    message: `Assurance expirant le ${new Date(t.insuranceExpirationDate).toLocaleDateString('fr-FR')} pour le camion ${t.plateNumber}`,
                    severity: 'high',
                });
            }
        });
        equipments.forEach(eq => {
            if (eq.nextMaintenanceDate && new Date(eq.nextMaintenanceDate) <= fifteenDaysFromNow) {
                alertes.push({
                    type: 'equipment_maintenance',
                    message: `Visite d'entretien recommandée pour l'équipement: ${eq.name} (${eq.serialNumber || 'sans n/s'})`,
                    severity: 'info',
                });
            }
        });
        const rentabilitéChantiers = await Promise.all(allMissions.map(async (m) => {
            const caPrevisionnel = Number(m.estimatedPrice) || 125000;
            const prod = await this.productionRepo.find({ where: { mission: { id: m.id } } });
            const totalRealised = prod.reduce((sum, p) => sum + Number(p.quantity), 0);
            const totalPlanned = Number(m.surfaceArea) || 350;
            const progress = Math.min(100, (totalRealised / totalPlanned));
            const caRealise = m.status === mission_entity_1.MissionStatus.COMPLETED
                ? (Number(m.actualPrice) || caPrevisionnel)
                : Math.round(progress * caPrevisionnel);
            const timeEntries = await this.timeRepo.find({
                where: { mission: { id: m.id } },
                relations: { employee: true },
            });
            let totalEmpMs = 0;
            const empHoursMap = new Map();
            timeEntries.forEach(entry => {
                const empId = entry.employee.id;
                const rate = Number(entry.employee.hourlyRate) || 35;
                empHoursMap.set(empId, (empHoursMap.get(empId) || 0) + 8);
            });
            let mainDOeuvreCost = 0;
            empHoursMap.forEach((hrs, empId) => {
                const emp = employees.find(e => e.id === empId);
                const rate = emp ? Number(emp.hourlyRate) : 35;
                mainDOeuvreCost += hrs * rate;
            });
            const displacementCost = timeEntries.filter(t => t.displacementMode === 'grand_deplacement').length * 120
                + timeEntries.filter(t => t.displacementMode === 'petit_deplacement').length * 40
                + timeEntries.filter(t => t.displacementMode === 'panier').length * 20;
            const sandCost = (m.sandBagsUsed || 0) * 8;
            const fuelCost = (Number(m.fuelConsumption) || 0) * 1.8;
            const coutReel = mainDOeuvreCost + displacementCost + sandCost + fuelCost;
            const margeBrute = caRealise - coutReel;
            const tauxMarge = caRealise > 0 ? Math.round((margeBrute / caRealise) * 1000) / 10 : 0;
            return {
                id: m.id,
                title: m.title,
                clientName: m.clientName || (m.client ? m.client.name : 'Client'),
                status: m.status,
                caPrevu: caPrevisionnel,
                caRealise,
                coutReel: Math.round(coutReel),
                margeBrute: Math.round(margeBrute),
                tauxMarge,
                progress: Math.round(progress * 100),
            };
        }));
        return {
            kpis: {
                salariésPrésentsActive: presentEmployeeIds.size,
                salariésPrésentsTotal: employees.length,
                chantiersEnCoursCount: activeMissions.length,
                heuresPointéesToday: heuresPointéesStr,
                m2RealisesToday,
            },
            productionToday: {
                total: m2RealisesToday,
                breakdown,
            },
            avancementChantiers,
            alertes,
            rentabilitéChantiers,
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
    __param(4, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(5, (0, typeorm_1.InjectRepository)(production_entry_entity_1.ProductionEntry)),
    __param(6, (0, typeorm_1.InjectRepository)(equipment_entity_1.Equipment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StatsService);
//# sourceMappingURL=stats.service.js.map