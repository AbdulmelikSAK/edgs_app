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
exports.SiteSupervisorsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const site_supervisor_entity_1 = require("../database/entities/site-supervisor.entity");
let SiteSupervisorsService = class SiteSupervisorsService {
    siteSupervisorRepo;
    constructor(siteSupervisorRepo) {
        this.siteSupervisorRepo = siteSupervisorRepo;
    }
    async findAll(clientId) {
        const query = this.siteSupervisorRepo.createQueryBuilder('supervisor')
            .leftJoinAndSelect('supervisor.client', 'client');
        if (clientId) {
            query.where('client.id = :clientId', { clientId });
        }
        return query.orderBy('supervisor.lastName', 'ASC').getMany();
    }
    async findOne(id) {
        const supervisor = await this.siteSupervisorRepo.findOne({
            where: { id },
            relations: { client: true },
        });
        if (!supervisor) {
            throw new common_1.NotFoundException(`Conducteur de travaux ${id} non trouvé`);
        }
        return supervisor;
    }
    async create(data) {
        const supervisor = this.siteSupervisorRepo.create({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email,
            client: { id: data.clientId },
        });
        return this.siteSupervisorRepo.save(supervisor);
    }
    async update(id, data) {
        const supervisor = await this.findOne(id);
        if (data.firstName !== undefined)
            supervisor.firstName = data.firstName;
        if (data.lastName !== undefined)
            supervisor.lastName = data.lastName;
        if (data.phone !== undefined)
            supervisor.phone = data.phone;
        if (data.email !== undefined)
            supervisor.email = data.email;
        if (data.clientId !== undefined)
            supervisor.client = { id: data.clientId };
        return this.siteSupervisorRepo.save(supervisor);
    }
    async remove(id) {
        const supervisor = await this.findOne(id);
        await this.siteSupervisorRepo.remove(supervisor);
    }
};
exports.SiteSupervisorsService = SiteSupervisorsService;
exports.SiteSupervisorsService = SiteSupervisorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(site_supervisor_entity_1.SiteSupervisor)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SiteSupervisorsService);
//# sourceMappingURL=site-supervisors.service.js.map