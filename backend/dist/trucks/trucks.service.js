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
exports.TrucksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const truck_entity_1 = require("../database/entities/truck.entity");
let TrucksService = class TrucksService {
    truckRepo;
    constructor(truckRepo) {
        this.truckRepo = truckRepo;
    }
    create(dto) {
        const truck = this.truckRepo.create(dto);
        return this.truckRepo.save(truck);
    }
    findAll() {
        return this.truckRepo.find({ where: { isActive: true } });
    }
    async findOne(id) {
        const truck = await this.truckRepo.findOne({ where: { id } });
        if (!truck)
            throw new common_1.NotFoundException(`Camion ${id} non trouvé`);
        return truck;
    }
    async update(id, dto) {
        const truck = await this.findOne(id);
        Object.assign(truck, dto);
        return this.truckRepo.save(truck);
    }
    async remove(id) {
        const truck = await this.findOne(id);
        truck.isActive = false;
        await this.truckRepo.save(truck);
    }
    async updateStock(id, newStock) {
        const truck = await this.findOne(id);
        truck.currentStock = newStock;
        return this.truckRepo.save(truck);
    }
    async getLowStockTrucks() {
        return this.truckRepo
            .createQueryBuilder('truck')
            .where('truck.isActive = true')
            .andWhere('truck.currentStock <= truck.stockAlertThreshold')
            .getMany();
    }
};
exports.TrucksService = TrucksService;
exports.TrucksService = TrucksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(truck_entity_1.Truck)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TrucksService);
//# sourceMappingURL=trucks.service.js.map