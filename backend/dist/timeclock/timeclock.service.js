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
        const isBadWeather = dto.type === 'intemperie' || dto.type === time_entry_entity_1.TimeEntryType.INTEMPERIE;
        if (isBadWeather) {
            const todayStart = new Date(dto.timestamp || new Date());
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date(dto.timestamp || new Date());
            todayEnd.setHours(23, 59, 59, 999);
            const existingTodayEntries = await this.timeEntryRepo.find({
                where: {
                    employee: { id: dto.employeeId },
                    timestamp: (0, typeorm_2.Between)(todayStart, todayEnd),
                },
            });
            for (const oldEntry of existingTodayEntries) {
                oldEntry.isBadWeather = true;
                oldEntry.entryCategory = 'INTEMPERIE';
                await this.timeEntryRepo.save(oldEntry);
            }
        }
        const entry = this.timeEntryRepo.create({
            employee,
            mission: mission ?? undefined,
            truck: truck ?? undefined,
            type: dto.type,
            entryCategory: isBadWeather ? 'INTEMPERIE' : 'TRAVAIL',
            isBadWeather,
            hoursWorked: isBadWeather ? 7.0 : undefined,
            timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
            latitude: dto.latitude,
            longitude: dto.longitude,
            notes: dto.notes,
            displacementMode: dto.displacementMode,
            signature: dto.signature,
            isOutOfZone: dto.isOutOfZone ?? false,
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
    async validateEntry(id, status, validationNote, newTimestamp, validatedBy) {
        const entry = await this.timeEntryRepo.findOne({ where: { id }, relations: { employee: true } });
        if (!entry)
            throw new common_1.NotFoundException('Pointage non trouvé');
        entry.validationStatus = status;
        if (validationNote !== undefined)
            entry.validationNote = validationNote;
        if (newTimestamp)
            entry.timestamp = new Date(newTimestamp);
        entry.validatedAt = new Date();
        if (validatedBy)
            entry.validatedBy = validatedBy;
        return this.timeEntryRepo.save(entry);
    }
    async validateBatch(employeeId, startDate, endDate, validatedBy) {
        const query = this.timeEntryRepo.createQueryBuilder('entry');
        query.where('entry.validationStatus = :pending', { pending: 'pending' });
        if (employeeId) {
            query.andWhere('entry.employeeId = :employeeId', { employeeId });
        }
        if (startDate && endDate) {
            query.andWhere('entry.timestamp BETWEEN :startDate AND :endDate', {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            });
        }
        const entries = await query.getMany();
        for (const entry of entries) {
            entry.validationStatus = 'validated';
            entry.validatedAt = new Date();
            if (validatedBy)
                entry.validatedBy = validatedBy;
            await this.timeEntryRepo.save(entry);
        }
        return { updated: entries.length };
    }
    async findFlaggedForEmployee(employeeId) {
        return this.timeEntryRepo.find({
            where: [
                { employee: { id: employeeId }, validationStatus: 'rejected' },
                { employee: { id: employeeId }, validationStatus: 'modified' },
            ],
            order: { timestamp: 'DESC' },
            take: 20,
        });
    }
    async findAllWithFilters(employeeId, startDate, endDate, status) {
        const query = this.timeEntryRepo.createQueryBuilder('entry')
            .leftJoinAndSelect('entry.employee', 'employee')
            .leftJoinAndSelect('entry.mission', 'mission')
            .leftJoinAndSelect('entry.truck', 'truck');
        if (employeeId) {
            query.andWhere('employee.id = :employeeId', { employeeId });
        }
        if (startDate && endDate) {
            query.andWhere('entry.timestamp BETWEEN :startDate AND :endDate', {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            });
        }
        if (status) {
            query.andWhere('entry.validationStatus = :status', { status });
        }
        return query.orderBy('entry.timestamp', 'DESC').getMany();
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