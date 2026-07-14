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
exports.EquipmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const equipment_entity_1 = require("../database/entities/equipment.entity");
const truck_entity_1 = require("../database/entities/truck.entity");
let EquipmentService = class EquipmentService {
    equipmentRepo;
    truckRepo;
    constructor(equipmentRepo, truckRepo) {
        this.equipmentRepo = equipmentRepo;
        this.truckRepo = truckRepo;
    }
    async create(dto) {
        const truck = dto.assignedTruckId
            ? await this.truckRepo.findOne({ where: { id: dto.assignedTruckId } })
            : null;
        const equipment = this.equipmentRepo.create({
            name: dto.name,
            serialNumber: dto.serialNumber,
            purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
            lastMaintenanceDate: dto.lastMaintenanceDate ? new Date(dto.lastMaintenanceDate) : undefined,
            nextMaintenanceDate: dto.nextMaintenanceDate ? new Date(dto.nextMaintenanceDate) : undefined,
            status: dto.status ?? 'Disponible',
            notes: dto.notes,
            assignedTruck: truck ?? undefined,
        });
        return this.equipmentRepo.save(equipment);
    }
    async findAll() {
        return this.equipmentRepo.find({
            relations: { assignedTruck: true },
            order: { name: 'ASC' },
        });
    }
    async findOne(id) {
        const equipment = await this.equipmentRepo.findOne({
            where: { id },
            relations: { assignedTruck: true },
        });
        if (!equipment)
            throw new common_1.NotFoundException(`Équipement ${id} non trouvé`);
        return equipment;
    }
    async update(id, dto) {
        const equipment = await this.findOne(id);
        if (dto.assignedTruckId !== undefined) {
            if (dto.assignedTruckId === null) {
                equipment.assignedTruck = null;
            }
            else {
                const truck = await this.truckRepo.findOne({ where: { id: dto.assignedTruckId } });
                if (!truck)
                    throw new common_1.NotFoundException('Camion non trouvé');
                equipment.assignedTruck = truck;
            }
        }
        if (dto.name !== undefined)
            equipment.name = dto.name;
        if (dto.serialNumber !== undefined)
            equipment.serialNumber = dto.serialNumber;
        if (dto.purchaseDate !== undefined)
            equipment.purchaseDate = dto.purchaseDate ? new Date(dto.purchaseDate) : null;
        if (dto.lastMaintenanceDate !== undefined)
            equipment.lastMaintenanceDate = dto.lastMaintenanceDate
                ? new Date(dto.lastMaintenanceDate)
                : null;
        if (dto.nextMaintenanceDate !== undefined)
            equipment.nextMaintenanceDate = dto.nextMaintenanceDate
                ? new Date(dto.nextMaintenanceDate)
                : null;
        if (dto.status !== undefined)
            equipment.status = dto.status;
        if (dto.notes !== undefined)
            equipment.notes = dto.notes;
        return this.equipmentRepo.save(equipment);
    }
    async remove(id) {
        const equipment = await this.findOne(id);
        await this.equipmentRepo.remove(equipment);
    }
};
exports.EquipmentService = EquipmentService;
exports.EquipmentService = EquipmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(equipment_entity_1.Equipment)),
    __param(1, (0, typeorm_1.InjectRepository)(truck_entity_1.Truck)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], EquipmentService);
//# sourceMappingURL=equipment.service.js.map