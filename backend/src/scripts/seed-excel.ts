import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import { Role, RoleName } from '../database/entities/role.entity';
import { User } from '../database/entities/user.entity';
import { Employee } from '../database/entities/employee.entity';
import { Truck } from '../database/entities/truck.entity';
import { Client } from '../database/entities/client.entity';
import { Worksite } from '../database/entities/worksite.entity';
import { Mission } from '../database/entities/mission.entity';
import { TimeEntry } from '../database/entities/time-entry.entity';
import { Report } from '../database/entities/report.entity';
import { StockMovement } from '../database/entities/stock-movement.entity';
import { TruckStock } from '../database/entities/truck-stock.entity';
import { TruckAssignment } from '../database/entities/truck-assignment.entity';
import { WeeklyPlanning } from '../database/entities/weekly-planning.entity';

async function runSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🚀 Démarrage du script d\'importation et réinitialisation des données EDGS...');

  // 1. Purge de l'ancienne donnée (chantiers, missions, plannings, véhicules, etc.) sauf Utilisateurs
  console.log('🧹 Purge des anciennes données...');
  
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Supprimer les dépendances en ordre inverse
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
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Erreur lors du nettoyage de la base de données:', err);
    process.exit(1);
  } finally {
    await queryRunner.release();
  }

  // 2. Charger le fichier JSON extrait de EDGS_Donnees.xlsx
  const dataPath = '/tmp/edgs_parsed_data.json';
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Fichier ${dataPath} introuvable. Veillez exécuter la préparation.`);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const { salaries, camions, clients } = rawData;

  const roleRepo = dataSource.getRepository(Role);
  let driverRole = await roleRepo.findOne({ where: { name: RoleName.DRIVER } });
  if (!driverRole) {
    driverRole = await roleRepo.save(roleRepo.create({ name: RoleName.DRIVER, description: 'Chauffeur / Opérateur' }));
  }

  const defaultPasswordHash = await bcrypt.hash('edgs2026!', 10);

  // 3. Import des Salariés
  console.log(`👤 Importation des ${salaries.length} salariés...`);
  const employeeRepo = dataSource.getRepository(Employee);
  
  for (const s of salaries) {
    const lastName = s.nom.trim();
    const firstName = s.prenom.trim();
    
    // Générer un nom d'utilisateur (ex: klary, sloukili, etc.)
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
    } else {
      emp.qualification = s.poste || s.metier || emp.qualification;
      emp.mustChangePassword = true;
      await employeeRepo.save(emp);
      console.log(`  ~ Salarié mis à jour: ${firstName} ${lastName}`);
    }
  }

  // 4. Import des Camions
  console.log(`🚛 Importation des ${camions.length} véhicules...`);
  const truckRepo = dataSource.getRepository(Truck);

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

  // 5. Import des Clients
  console.log(`🏢 Importation des ${clients.length} clients...`);
  const clientRepo = dataSource.getRepository(Client);

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
