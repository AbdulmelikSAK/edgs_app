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
exports.PlanningService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const weekly_planning_entity_1 = require("../database/entities/weekly-planning.entity");
const mission_entity_1 = require("../database/entities/mission.entity");
const truck_entity_1 = require("../database/entities/truck.entity");
let PlanningService = class PlanningService {
    planningRepo;
    missionRepo;
    truckRepo;
    constructor(planningRepo, missionRepo, truckRepo) {
        this.planningRepo = planningRepo;
        this.missionRepo = missionRepo;
        this.truckRepo = truckRepo;
    }
    async create(dto) {
        const mission = await this.missionRepo.findOne({ where: { id: dto.missionId } });
        const truck = dto.truckId ? await this.truckRepo.findOne({ where: { id: dto.truckId } }) : null;
        const entry = this.planningRepo.create({
            ...dto,
            mission: mission,
            truck: truck ?? undefined,
        });
        return this.planningRepo.save(entry);
    }
    findByWeek(year, week) {
        return this.planningRepo.find({
            where: { year, week },
            relations: {
                mission: {
                    client: true,
                    worksite: true,
                },
                truck: true,
            },
            order: { dayOfWeek: 'ASC' },
        });
    }
    async remove(id) {
        await this.planningRepo.delete(id);
    }
};
exports.PlanningService = PlanningService;
exports.PlanningService = PlanningService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(weekly_planning_entity_1.WeeklyPlanning)),
    __param(1, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __param(2, (0, typeorm_1.InjectRepository)(truck_entity_1.Truck)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PlanningService);
//# sourceMappingURL=planning.service.js.map