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
exports.MissionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const mission_entity_1 = require("../database/entities/mission.entity");
const truck_entity_1 = require("../database/entities/truck.entity");
const client_entity_1 = require("../database/entities/client.entity");
const worksite_entity_1 = require("../database/entities/worksite.entity");
let MissionsService = class MissionsService {
    missionRepo;
    truckRepo;
    clientRepo;
    worksiteRepo;
    constructor(missionRepo, truckRepo, clientRepo, worksiteRepo) {
        this.missionRepo = missionRepo;
        this.truckRepo = truckRepo;
        this.clientRepo = clientRepo;
        this.worksiteRepo = worksiteRepo;
    }
    async create(dto) {
        const truck = dto.truckId ? await this.truckRepo.findOne({ where: { id: dto.truckId } }) : null;
        const client = dto.clientId ? await this.clientRepo.findOne({ where: { id: dto.clientId } }) : null;
        const worksite = dto.worksiteId ? await this.worksiteRepo.findOne({ where: { id: dto.worksiteId } }) : null;
        const mission = this.missionRepo.create({
            ...dto,
            truck: truck ?? undefined,
            client: client ?? undefined,
            worksite: worksite ?? undefined,
        });
        return this.missionRepo.save(mission);
    }
    findAll() {
        return this.missionRepo.find({
            relations: { truck: true, client: true, worksite: true },
            order: { scheduledDate: 'DESC' },
        });
    }
    findByTruck(truckId) {
        return this.missionRepo.find({
            where: { truck: { id: truckId }, status: mission_entity_1.MissionStatus.IN_PROGRESS },
            relations: { truck: true, client: true, worksite: true },
        });
    }
    async findOne(id) {
        const mission = await this.missionRepo.findOne({
            where: { id },
            relations: { truck: true, client: true, worksite: true },
        });
        if (!mission)
            throw new common_1.NotFoundException(`Mission ${id} non trouvée`);
        return mission;
    }
    async update(id, dto) {
        const mission = await this.findOne(id);
        if (dto.truckId) {
            const truck = await this.truckRepo.findOne({ where: { id: dto.truckId } });
            if (truck)
                mission.truck = truck;
        }
        if (dto.clientId) {
            const client = await this.clientRepo.findOne({ where: { id: dto.clientId } });
            if (client)
                mission.client = client;
        }
        if (dto.worksiteId) {
            const worksite = await this.worksiteRepo.findOne({ where: { id: dto.worksiteId } });
            if (worksite)
                mission.worksite = worksite;
        }
        Object.assign(mission, dto);
        return this.missionRepo.save(mission);
    }
    async updateStatus(id, status) {
        const mission = await this.findOne(id);
        mission.status = status;
        if (status === mission_entity_1.MissionStatus.IN_PROGRESS)
            mission.startedAt = new Date();
        if (status === mission_entity_1.MissionStatus.COMPLETED)
            mission.completedAt = new Date();
        return this.missionRepo.save(mission);
    }
    async remove(id) {
        await this.missionRepo.delete(id);
    }
    findTodayMissions(truckId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.missionRepo.find({
            where: { truck: { id: truckId }, scheduledDate: (0, typeorm_2.Between)(today, tomorrow) },
            relations: { truck: true, client: true, worksite: true },
        });
    }
};
exports.MissionsService = MissionsService;
exports.MissionsService = MissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __param(1, (0, typeorm_1.InjectRepository)(truck_entity_1.Truck)),
    __param(2, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __param(3, (0, typeorm_1.InjectRepository)(worksite_entity_1.Worksite)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MissionsService);
//# sourceMappingURL=missions.service.js.map