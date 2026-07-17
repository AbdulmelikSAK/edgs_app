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
exports.GpsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const gps_point_entity_1 = require("../database/entities/gps-point.entity");
const truck_entity_1 = require("../database/entities/truck.entity");
const mission_entity_1 = require("../database/entities/mission.entity");
let GpsService = class GpsService {
    gpsRepo;
    truckRepo;
    missionRepo;
    constructor(gpsRepo, truckRepo, missionRepo) {
        this.gpsRepo = gpsRepo;
        this.truckRepo = truckRepo;
        this.missionRepo = missionRepo;
    }
    async track(dto) {
        const truck = await this.truckRepo.findOne({ where: { id: dto.truckId } });
        if (!truck)
            throw new common_1.NotFoundException('Camion non trouvé');
        const mission = dto.missionId ? await this.missionRepo.findOne({ where: { id: dto.missionId } }) : null;
        const point = this.gpsRepo.create({
            truck,
            mission: mission ?? undefined,
            latitude: dto.latitude,
            longitude: dto.longitude,
            speed: dto.speed,
            accuracy: dto.accuracy,
            isSyncedFromOffline: dto.isSyncedFromOffline ?? false,
            isOutOfZone: dto.isOutOfZone ?? false,
        });
        return this.gpsRepo.save(point);
    }
    async syncBatch(points) {
        const results = [];
        for (const dto of points) {
            dto.isSyncedFromOffline = true;
            results.push(await this.track(dto));
        }
        return results;
    }
    async getLivePositions() {
        const result = await this.gpsRepo
            .createQueryBuilder('gps')
            .innerJoin('gps.truck', 'truck')
            .select([
            'truck.id AS "truckId"',
            'truck.plateNumber AS "truckPlate"',
            'gps.latitude AS latitude',
            'gps.longitude AS longitude',
            'gps.speed AS speed',
            'gps.isOutOfZone AS "isOutOfZone"',
            'gps.createdAt AS "timestamp"',
        ])
            .where('truck.isActive = true')
            .distinctOn(['truck.id'])
            .orderBy('truck.id')
            .addOrderBy('gps.createdAt', 'DESC')
            .getRawMany();
        return result.map(pos => ({
            ...pos,
            latitude: Number(pos.latitude),
            longitude: Number(pos.longitude),
            speed: Number(pos.speed || 0),
        }));
    }
    getHistory(truckId, from, to) {
        const qb = this.gpsRepo
            .createQueryBuilder('gps')
            .where('gps.truckId = :truckId', { truckId })
            .orderBy('gps.createdAt', 'ASC');
        if (from)
            qb.andWhere('gps.createdAt >= :from', { from });
        if (to)
            qb.andWhere('gps.createdAt <= :to', { to });
        return qb.take(1000).getMany();
    }
};
exports.GpsService = GpsService;
exports.GpsService = GpsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gps_point_entity_1.GpsPoint)),
    __param(1, (0, typeorm_1.InjectRepository)(truck_entity_1.Truck)),
    __param(2, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], GpsService);
//# sourceMappingURL=gps.service.js.map