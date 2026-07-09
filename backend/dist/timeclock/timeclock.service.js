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
exports.TimeclockService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const time_entry_entity_1 = require("../database/entities/time-entry.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
const mission_entity_1 = require("../database/entities/mission.entity");
const truck_entity_1 = require("../database/entities/truck.entity");
let TimeclockService = class TimeclockService {
    timeEntryRepo;
    employeeRepo;
    missionRepo;
    truckRepo;
    constructor(timeEntryRepo, employeeRepo, missionRepo, truckRepo) {
        this.timeEntryRepo = timeEntryRepo;
        this.employeeRepo = employeeRepo;
        this.missionRepo = missionRepo;
        this.truckRepo = truckRepo;
    }
    async createEntry(dto) {
        const employee = await this.employeeRepo.findOne({ where: { id: dto.employeeId } });
        if (!employee)
            throw new common_1.NotFoundException('Employé non trouvé');
        const mission = dto.missionId ? await this.missionRepo.findOne({ where: { id: dto.missionId } }) : null;
        const truck = dto.truckId ? await this.truckRepo.findOne({ where: { id: dto.truckId } }) : null;
        const entry = this.timeEntryRepo.create({
            employee,
            mission: mission ?? undefined,
            truck: truck ?? undefined,
            type: dto.type,
            timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
            latitude: dto.latitude,
            longitude: dto.longitude,
            notes: dto.notes,
            isSyncedFromOffline: dto.isSyncedFromOffline ?? false,
        });
        return this.timeEntryRepo.save(entry);
    }
    async syncBatch(entries) {
        const results = [];
        for (const dto of entries) {
            dto.isSyncedFromOffline = true;
            results.push(await this.createEntry(dto));
        }
        return results;
    }
    findByEmployee(employeeId, date) {
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            return this.timeEntryRepo.find({
                where: { employee: { id: employeeId }, timestamp: (0, typeorm_2.Between)(start, end) },
                order: { timestamp: 'ASC' },
            });
        }
        return this.timeEntryRepo.find({
            where: { employee: { id: employeeId } },
            order: { timestamp: 'DESC' },
            take: 50,
        });
    }
    findByMission(missionId) {
        return this.timeEntryRepo.find({
            where: { mission: { id: missionId } },
            relations: { employee: true },
            order: { timestamp: 'ASC' },
        });
    }
};
exports.TimeclockService = TimeclockService;
exports.TimeclockService = TimeclockService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(time_entry_entity_1.TimeEntry)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(2, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __param(3, (0, typeorm_1.InjectRepository)(truck_entity_1.Truck)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TimeclockService);
//# sourceMappingURL=timeclock.service.js.map