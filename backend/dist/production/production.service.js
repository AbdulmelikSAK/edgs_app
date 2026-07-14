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
exports.ProductionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const production_entry_entity_1 = require("../database/entities/production-entry.entity");
const mission_entity_1 = require("../database/entities/mission.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
let ProductionService = class ProductionService {
    productionRepo;
    missionRepo;
    employeeRepo;
    constructor(productionRepo, missionRepo, employeeRepo) {
        this.productionRepo = productionRepo;
        this.missionRepo = missionRepo;
        this.employeeRepo = employeeRepo;
    }
    async create(dto) {
        const mission = await this.missionRepo.findOne({ where: { id: dto.missionId } });
        if (!mission)
            throw new common_1.NotFoundException('Mission non trouvée');
        const employee = dto.employeeId
            ? await this.employeeRepo.findOne({ where: { id: dto.employeeId } })
            : null;
        const entry = this.productionRepo.create({
            mission,
            employee: employee ?? undefined,
            date: dto.date ? new Date(dto.date) : new Date(),
            prestationType: dto.prestationType,
            quantity: dto.quantity,
            unit: dto.unit,
            notes: dto.notes,
        });
        const saved = await this.productionRepo.save(entry);
        const allProductionForMission = await this.productionRepo.find({
            where: { mission: { id: mission.id } },
        });
        const totalQty = allProductionForMission.reduce((sum, p) => sum + Number(p.quantity), 0);
        mission.surfaceArea = totalQty;
        await this.missionRepo.save(mission);
        return saved;
    }
    async findAll(missionId) {
        if (missionId) {
            return this.productionRepo.find({
                where: { mission: { id: missionId } },
                relations: { employee: true, mission: true },
                order: { date: 'DESC' },
            });
        }
        return this.productionRepo.find({
            relations: { employee: true, mission: true },
            order: { date: 'DESC' },
        });
    }
    async getProductionStatsToday() {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const entriesToday = await this.productionRepo
            .createQueryBuilder('p')
            .where('p.date BETWEEN :start AND :end', { start, end })
            .getMany();
        const statsByType = {};
        let total = 0;
        entriesToday.forEach((entry) => {
            const type = entry.prestationType || 'Autre';
            const qty = Number(entry.quantity);
            statsByType[type] = (statsByType[type] || 0) + qty;
            total += qty;
        });
        return {
            total,
            breakdown: Object.keys(statsByType).map((name) => ({
                name,
                quantity: statsByType[name],
                percentage: total > 0 ? Math.round((statsByType[name] / total) * 100) : 0,
            })),
        };
    }
};
exports.ProductionService = ProductionService;
exports.ProductionService = ProductionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(production_entry_entity_1.ProductionEntry)),
    __param(1, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __param(2, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductionService);
//# sourceMappingURL=production.service.js.map