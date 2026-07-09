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
const worksite_entity_1 = require("./entities/worksite.entity");
const mission_entity_1 = require("./entities/mission.entity");
let SeederService = class SeederService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async onApplicationBootstrap() {
        await this.seed();
    }
    async seed() {
        const roleRepo = this.dataSource.getRepository(role_entity_1.Role);
        const count = await roleRepo.count();
        if (count > 0) {
            console.log('Database already has data. Skipping seeding.');
            return;
        }
        console.log('🌱 Seeding database...');
        const roles = [];
        for (const name of Object.values(role_entity_1.RoleName)) {
            const role = roleRepo.create({
                name,
                description: `${name} role`,
            });
            roles.push(await roleRepo.save(role));
        }
        const adminRole = roles.find((r) => r.name === role_entity_1.RoleName.ADMIN);
        const managerRole = roles.find((r) => r.name === role_entity_1.RoleName.MANAGER);
        const driverRole = roles.find((r) => r.name === role_entity_1.RoleName.DRIVER);
        const userRepo = this.dataSource.getRepository(user_entity_1.User);
        const adminUser = userRepo.create({
            email: 'admin@edgs.fr',
            passwordHash: await bcrypt.hash('admin123', 10),
            firstName: 'Directeur',
            lastName: 'EDGS',
            role: adminRole,
        });
        await userRepo.save(adminUser);
        const dispatcherUser = userRepo.create({
            email: 'manager@edgs.fr',
            passwordHash: await bcrypt.hash('manager123', 10),
            firstName: 'Planning',
            lastName: 'EDGS',
            role: managerRole,
        });
        await userRepo.save(dispatcherUser);
        const employeeRepo = this.dataSource.getRepository(employee_entity_1.Employee);
        const driverEmp = employeeRepo.create({
            firstName: 'Jean',
            lastName: 'Chauffeur',
            pin: await bcrypt.hash('1234', 10),
            badgeNumber: 'BDG001',
            role: driverRole,
        });
        await employeeRepo.save(driverEmp);
        const managerEmp = employeeRepo.create({
            firstName: 'Paul',
            lastName: 'Chef',
            pin: await bcrypt.hash('4321', 10),
            badgeNumber: 'BDG002',
            role: managerRole,
        });
        await employeeRepo.save(managerEmp);
        const adminEmp = employeeRepo.create({
            firstName: 'Pierre',
            lastName: 'Admin',
            pin: await bcrypt.hash('0000', 10),
            badgeNumber: 'BDG003',
            role: adminRole,
        });
        await employeeRepo.save(adminEmp);
        const truckRepo = this.dataSource.getRepository(truck_entity_1.Truck);
        const truck1 = truckRepo.create({
            plateNumber: 'AA-123-BB',
            model: 'Renault Kerax',
            year: 2018,
            currentStock: 50,
            stockAlertThreshold: 10,
        });
        await truckRepo.save(truck1);
        const truck2 = truckRepo.create({
            plateNumber: 'CC-456-DD',
            model: 'Volvo FMX',
            year: 2020,
            currentStock: 30,
            stockAlertThreshold: 10,
        });
        await truckRepo.save(truck2);
        const clientRepo = this.dataSource.getRepository(client_entity_1.Client);
        const client1 = clientRepo.create({
            name: 'BTP Construction SAS',
            email: 'contact@btp-construction.fr',
            phone: '0123456789',
            address: '10 Rue de la Paix, 75002 Paris',
        });
        await clientRepo.save(client1);
        const client2 = clientRepo.create({
            name: 'Grillon Sablage SARL',
            email: 'info@grillon-sablage.fr',
            phone: '0490123456',
            address: 'Route de Valréas, 84600 Grillon',
        });
        await clientRepo.save(client2);
        const worksiteRepo = this.dataSource.getRepository(worksite_entity_1.Worksite);
        const worksite1 = worksiteRepo.create({
            name: 'Chantier Rénovation Façade Paris',
            address: '25 Avenue des Champs-Élysées, 75008 Paris',
            latitude: 48.8698,
            longitude: 2.3075,
        });
        await worksiteRepo.save(worksite1);
        const worksite2 = worksiteRepo.create({
            name: 'Pont de Grillon Sablage',
            address: 'Chemin du Sablage, 84600 Grillon',
            latitude: 44.3958,
            longitude: 4.9285,
        });
        await worksiteRepo.save(worksite2);
        const missionRepo = this.dataSource.getRepository(mission_entity_1.Mission);
        const today = new Date();
        const mission1 = missionRepo.create({
            title: 'Sablage Façade Paris',
            description: 'Sablage de la façade principale, grain moyen.',
            scheduledDate: today,
            status: mission_entity_1.MissionStatus.PLANNED,
            client: client1,
            worksite: worksite1,
            truck: truck1,
            notes: 'Porter les EPI obligatoires.',
        });
        await missionRepo.save(mission1);
        const mission2 = missionRepo.create({
            title: 'Sablage Pont de Grillon',
            description: 'Nettoyage des poutres en béton avant traitement.',
            scheduledDate: today,
            status: mission_entity_1.MissionStatus.IN_PROGRESS,
            client: client2,
            worksite: worksite2,
            truck: truck2,
            notes: 'Buse de sablage numéro 8.',
            startedAt: new Date(today.getTime() - 2 * 60 * 60 * 1000),
        });
        await missionRepo.save(mission2);
        console.log('✅ Seeding completed.');
    }
};
exports.SeederService = SeederService;
exports.SeederService = SeederService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], SeederService);
//# sourceMappingURL=seeder.service.js.map