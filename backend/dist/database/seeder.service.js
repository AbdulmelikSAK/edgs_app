"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeederService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const role_entity_1 = require("./entities/role.entity");
const user_entity_1 = require("./entities/user.entity");
const employee_entity_1 = require("./entities/employee.entity");
const truck_entity_1 = require("./entities/truck.entity");
const client_entity_1 = require("./entities/client.entity");
const edgs_parsed_data_1 = require("./edgs_parsed_data");
let SeederService = class SeederService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async onApplicationBootstrap() {
        await this.seed();
    }
    async seed() {
        const clientRepo = this.dataSource.getRepository(client_entity_1.Client);
        const clientCount = await clientRepo.count();
        if (clientCount >= 100 && process.env.FORCE_SEED !== 'true') {
            console.log(`✅ Base de données déjà à jour (${clientCount} clients présent(s)).`);
            return;
        }
        console.log('🌱 Seed / Nettoyage et importation des données Excel EDGS...');
        await this.executeExcelSeed();
    }
    async executeExcelSeed() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            console.log('🧹 Purge des anciennes données opérationnelles...');
            await queryRunner.query('DELETE FROM time_entries;');
            await queryRunner.query('DELETE FROM reports;');
            await queryRunner.query('DELETE FROM gps_points;');
            await queryRunner.query('DELETE FROM mission_photos;');
            await queryRunner.query('DELETE FROM stock_movements;');
            await queryRunner.query('DELETE FROM truck_stocks;');
            await queryRunner.query('DELETE FROM truck_assignments;');
            await queryRunner.query('DELETE FROM weekly_planning;');
            await queryRunner.query('DELETE FROM invoices;');
            await queryRunner.query('DELETE FROM quotes;');
            await queryRunner.query('DELETE FROM production_entries;');
            await queryRunner.query('DELETE FROM mission_employees;');
            await queryRunner.query('DELETE FROM missions;');
            await queryRunner.query('DELETE FROM worksites;');
            await queryRunner.query('DELETE FROM trucks;');
            await queryRunner.query('DELETE FROM clients;');
            await queryRunner.commitTransaction();
            console.log('✅ Base réinitialisée (utilisateurs préservés).');
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            console.error('❌ Erreur lors de la purge:', err);
        }
        finally {
            await queryRunner.release();
        }
        const roleRepo = this.dataSource.getRepository(role_entity_1.Role);
        let adminRole = await roleRepo.findOne({ where: { name: role_entity_1.RoleName.ADMIN } });
        if (!adminRole) {
            adminRole = await roleRepo.save(roleRepo.create({ name: role_entity_1.RoleName.ADMIN, description: 'Administrateur' }));
        }
        let managerRole = await roleRepo.findOne({ where: { name: role_entity_1.RoleName.MANAGER } });
        if (!managerRole) {
            managerRole = await roleRepo.save(roleRepo.create({ name: role_entity_1.RoleName.MANAGER, description: 'Responsable' }));
        }
        let driverRole = await roleRepo.findOne({ where: { name: role_entity_1.RoleName.DRIVER } });
        if (!driverRole) {
            driverRole = await roleRepo.save(roleRepo.create({ name: role_entity_1.RoleName.DRIVER, description: 'Chauffeur / Opérateur' }));
        }
        const userRepo = this.dataSource.getRepository(user_entity_1.User);
        let adminUser = await userRepo.findOne({ where: { email: 'admin@edgs.fr' } });
        if (!adminUser) {
            adminUser = userRepo.create({
                email: 'admin@edgs.fr',
                passwordHash: await bcrypt.hash('admin123', 10),
                firstName: 'Directeur',
                lastName: 'EDGS',
                role: adminRole,
            });
            await userRepo.save(adminUser);
        }
        const { salaries, camions, clients } = edgs_parsed_data_1.edgsParsedData;
        const defaultPasswordHash = await bcrypt.hash('edgs2026!', 10);
        const employeeRepo = this.dataSource.getRepository(employee_entity_1.Employee);
        for (const s of salaries) {
            const lastName = s.nom.trim();
            const firstName = s.prenom.trim();
            const cleanFirstName = firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
            const cleanLastName = lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
            const username = `${cleanFirstName.charAt(0)}${cleanLastName}`;
            let emp = await employeeRepo.findOne({ where: [{ username }, { firstName, lastName }] });
            if (!emp) {
                emp = employeeRepo.create({
                    firstName,
                    lastName,
                    username,
                    passwordHash: defaultPasswordHash,
                    mustChangePassword: true,
                    qualification: s.poste || s.metier || 'Opérateur',
                    role: driverRole,
                    hourlyRate: 15.00,
                    paidLeaveBalance: 25.00,
                    rttBalance: 12.00,
                    isActive: true,
                });
                await employeeRepo.save(emp);
            }
            else {
                emp.mustChangePassword = true;
                await employeeRepo.save(emp);
            }
        }
        const truckRepo = this.dataSource.getRepository(truck_entity_1.Truck);
        for (const c of camions) {
            const plateNumber = c.immatriculation.trim();
            const modelStr = `${c.marque.trim()} ${c.modele.trim()}`.trim();
            const truck = truckRepo.create({
                plateNumber,
                model: modelStr,
                type: c.type || 'Fourgon',
                currentStock: 50,
                stockAlertThreshold: 10,
                isActive: true,
            });
            await truckRepo.save(truck);
        }
        const clientRepo = this.dataSource.getRepository(client_entity_1.Client);
        for (const cl of clients) {
            const client = clientRepo.create({
                code: cl.code.trim(),
                name: cl.nom.trim(),
                address: cl.address?.trim() || null,
                zipCode: cl.zipCode?.trim() || null,
                city: cl.city?.trim() || null,
                countryCode: cl.countryCode?.trim() || null,
                email: cl.email?.trim() || null,
                phone: cl.phone?.trim() || null,
                isActive: true,
            });
            await clientRepo.save(client);
        }
        console.log(`🎉 Seed Excel exécuté avec succès : ${clients.length} clients, ${camions.length} camions, ${salaries.length} salariés.`);
    }
};
exports.SeederService = SeederService;
exports.SeederService = SeederService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], SeederService);
//# sourceMappingURL=seeder.service.js.map