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
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const fs = __importStar(require("fs"));
const role_entity_1 = require("../database/entities/role.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
const truck_entity_1 = require("../database/entities/truck.entity");
const client_entity_1 = require("../database/entities/client.entity");
async function runSeed() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const dataSource = app.get(typeorm_1.DataSource);
    console.log('🚀 Démarrage du script d\'importation et réinitialisation des données EDGS...');
    console.log('🧹 Purge des anciennes données...');
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
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
        console.log('✅ Anciennes données nettoyées avec succès (utilisateurs préservés).');
    }
    catch (err) {
        await queryRunner.rollbackTransaction();
        console.error('❌ Erreur lors du nettoyage de la base de données:', err);
        process.exit(1);
    }
    finally {
        await queryRunner.release();
    }
    const dataPath = '/tmp/edgs_parsed_data.json';
    if (!fs.existsSync(dataPath)) {
        console.error(`❌ Fichier ${dataPath} introuvable. Veillez exécuter la préparation.`);
        process.exit(1);
    }
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const { salaries, camions, clients } = rawData;
    const roleRepo = dataSource.getRepository(role_entity_1.Role);
    let driverRole = await roleRepo.findOne({ where: { name: role_entity_1.RoleName.DRIVER } });
    if (!driverRole) {
        driverRole = await roleRepo.save(roleRepo.create({ name: role_entity_1.RoleName.DRIVER, description: 'Chauffeur / Opérateur' }));
    }
    const defaultPasswordHash = await bcrypt.hash('edgs2026!', 10);
    console.log(`👤 Importation des ${salaries.length} salariés...`);
    const employeeRepo = dataSource.getRepository(employee_entity_1.Employee);
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
            console.log(`  + Salarié créé: ${firstName} ${lastName} (username: ${username})`);
        }
        else {
            emp.qualification = s.poste || s.metier || emp.qualification;
            emp.mustChangePassword = true;
            await employeeRepo.save(emp);
            console.log(`  ~ Salarié mis à jour: ${firstName} ${lastName}`);
        }
    }
    console.log(`🚛 Importation des ${camions.length} véhicules...`);
    const truckRepo = dataSource.getRepository(truck_entity_1.Truck);
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
        console.log(`  + Véhicule créé: ${modelStr} [${plateNumber}] (${c.type})`);
    }
    console.log(`🏢 Importation des ${clients.length} clients...`);
    const clientRepo = dataSource.getRepository(client_entity_1.Client);
    let insertedClients = 0;
    for (const cl of clients) {
        const client = clientRepo.create({
            code: cl.code.trim(),
            name: cl.nom.trim(),
            address: cl.address.trim() || null,
            zipCode: cl.zipCode.trim() || null,
            city: cl.city.trim() || null,
            countryCode: cl.countryCode.trim() || null,
            email: cl.email.trim() || null,
            phone: cl.phone.trim() || null,
            isActive: true,
        });
        await clientRepo.save(client);
        insertedClients++;
    }
    console.log(`✅ ${insertedClients} clients importés.`);
    console.log('🎉 Importation terminée avec succès !');
    await app.close();
    process.exit(0);
}
runSeed().catch((err) => {
    console.error('❌ Erreur lors de l\'exécution du seed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed-excel.js.map