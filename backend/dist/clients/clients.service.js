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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const client_entity_1 = require("../database/entities/client.entity");
const client_contact_entity_1 = require("../database/entities/client-contact.entity");
const site_supervisor_entity_1 = require("../database/entities/site-supervisor.entity");
let ClientsService = class ClientsService {
    clientRepo;
    contactRepo;
    supervisorRepo;
    constructor(clientRepo, contactRepo, supervisorRepo) {
        this.clientRepo = clientRepo;
        this.contactRepo = contactRepo;
        this.supervisorRepo = supervisorRepo;
    }
    async create(dto) {
        const { contacts, siteSupervisors, ...clientData } = dto;
        const client = this.clientRepo.create(clientData);
        const savedClient = await this.clientRepo.save(client);
        if (contacts && contacts.length > 0) {
            const contactEntities = contacts.map(c => this.contactRepo.create({ ...c, client: savedClient }));
            await this.contactRepo.save(contactEntities);
        }
        if (siteSupervisors && siteSupervisors.length > 0) {
            const supervisorEntities = siteSupervisors.map(s => this.supervisorRepo.create({ ...s, client: savedClient }));
            await this.supervisorRepo.save(supervisorEntities);
        }
        return this.findOne(savedClient.id);
    }
    findAll() {
        return this.clientRepo.find({
            where: { isActive: true },
            relations: { contacts: true, siteSupervisors: true },
            order: { name: 'ASC' },
        });
    }
    async findOne(id) {
        const client = await this.clientRepo.findOne({
            where: { id },
            relations: { contacts: true, siteSupervisors: true },
        });
        if (!client)
            throw new common_1.NotFoundException(`Client ${id} non trouvé`);
        return client;
    }
    async update(id, dto) {
        const client = await this.findOne(id);
        Object.assign(client, dto);
        return this.clientRepo.save(client);
    }
    async remove(id) {
        const client = await this.findOne(id);
        client.isActive = false;
        await this.clientRepo.save(client);
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __param(1, (0, typeorm_1.InjectRepository)(client_contact_entity_1.ClientContact)),
    __param(2, (0, typeorm_1.InjectRepository)(site_supervisor_entity_1.SiteSupervisor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ClientsService);
//# sourceMappingURL=clients.service.js.map