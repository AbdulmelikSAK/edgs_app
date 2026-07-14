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
const truck_assignment_entity_1 = require("../database/entities/truck-assignment.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
let TrucksService = class TrucksService {
    truckRepo;
    assignmentRepo;
    employeeRepo;
    constructor(truckRepo, assignmentRepo, employeeRepo) {
        this.truckRepo = truckRepo;
        this.assignmentRepo = assignmentRepo;
        this.employeeRepo = employeeRepo;
    }
    create(dto) {
        const truck = this.truckRepo.create(dto);
        return this.truckRepo.save(truck);
    }
    findAll() {
        return this.truckRepo.find({
            where: { isActive: true },
            relations: { stocks: { stockItem: true } },
            order: { plateNumber: 'ASC' }
        });
    }
    async findOne(id) {
        const truck = await this.truckRepo.findOne({
            where: { id },
            relations: { stocks: { stockItem: true } }
        });
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
    async assignTruck(truckId, employeeId, startDate, notes) {
        const truck = await this.findOne(truckId);
        const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });
        if (!employee)
            throw new common_1.NotFoundException('Employé non trouvé');
        const activeTruckAss = await this.assignmentRepo.findOne({
            where: { truck: { id: truckId }, endDate: (0, typeorm_2.IsNull)() }
        });
        if (activeTruckAss) {
            activeTruckAss.endDate = new Date();
            await this.assignmentRepo.save(activeTruckAss);
        }
        const activeEmpAss = await this.assignmentRepo.findOne({
            where: { employee: { id: employeeId }, endDate: (0, typeorm_2.IsNull)() }
        });
        if (activeEmpAss) {
            activeEmpAss.endDate = new Date();
            await this.assignmentRepo.save(activeEmpAss);
        }
        const assignment = this.assignmentRepo.create({
            truck,
            employee,
            startDate: startDate ? new Date(startDate) : new Date(),
            notes,
        });
        return this.assignmentRepo.save(assignment);
    }
    async unassignTruck(assignmentId, endDate) {
        const ass = await this.assignmentRepo.findOne({ where: { id: assignmentId } });
        if (!ass)
            throw new common_1.NotFoundException('Affectation non trouvée');
        ass.endDate = endDate ? new Date(endDate) : new Date();
        return this.assignmentRepo.save(ass);
    }
    async getAssignments(truckId) {
        if (truckId) {
            return this.assignmentRepo.find({
                where: { truck: { id: truckId } },
                relations: { truck: true, employee: true },
                order: { startDate: 'DESC' }
            });
        }
        return this.assignmentRepo.find({
            relations: { truck: true, employee: true },
            order: { startDate: 'DESC' }
        });
    }
    async searchDriverByDate(plateNumber, dateStr) {
        const date = new Date(dateStr);
        const ass = await this.assignmentRepo.findOne({
            where: [
                {
                    truck: { plateNumber },
                    startDate: (0, typeorm_2.LessThanOrEqual)(date),
                    endDate: (0, typeorm_2.MoreThanOrEqual)(date)
                },
                {
                    truck: { plateNumber },
                    startDate: (0, typeorm_2.LessThanOrEqual)(date),
                    endDate: (0, typeorm_2.IsNull)()
                }
            ],
            relations: { employee: true }
        });
        return ass ? ass.employee : null;
    }
};
exports.TrucksService = TrucksService;
exports.TrucksService = TrucksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(truck_entity_1.Truck)),
    __param(1, (0, typeorm_1.InjectRepository)(truck_assignment_entity_1.TruckAssignment)),
    __param(2, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TrucksService);
//# sourceMappingURL=trucks.service.js.map