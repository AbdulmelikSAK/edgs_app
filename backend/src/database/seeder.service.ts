import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, RoleName } from './entities/role.entity';
import { User } from './entities/user.entity';
import { Employee } from './entities/employee.entity';
import { Truck } from './entities/truck.entity';
import { Client } from './entities/client.entity';
import { edgsParsedData } from './edgs_parsed_data';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  constructor(private dataSource: DataSource) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    const clientRepo = this.dataSource.getRepository(Client);
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
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Erreur lors de la purge:', err);
    } finally {
      await queryRunner.release();
    }

    // 1. Initialiser les Rôles et Utilisateurs Admin si absents
    const roleRepo = this.dataSource.getRepository(Role);
    let adminRole = await roleRepo.findOne({ where: { name: RoleName.ADMIN } });
    if (!adminRole) {
      adminRole = await roleRepo.save(roleRepo.create({ name: RoleName.ADMIN, description: 'Administrateur' }));
    }
    let managerRole = await roleRepo.findOne({ where: { name: RoleName.MANAGER } });
    if (!managerRole) {
      managerRole = await roleRepo.save(roleRepo.create({ name: RoleName.MANAGER, description: 'Responsable' }));
    }
    let driverRole = await roleRepo.findOne({ where: { name: RoleName.DRIVER } });
    if (!driverRole) {
      driverRole = await roleRepo.save(roleRepo.create({ name: RoleName.DRIVER, description: 'Chauffeur / Opérateur' }));
    }

    const userRepo = this.dataSource.getRepository(User);
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

    // 2. Récupération des données typées
    const { salaries, camions, clients } = edgsParsedData as { salaries: any[]; camions: any[]; clients: any[] };
    const defaultPasswordHash = await bcrypt.hash('edgs2026!', 10);

    // 3. Import des Salariés
    const employeeRepo = this.dataSource.getRepository(Employee);
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
      } else {
        emp.mustChangePassword = true;
        await employeeRepo.save(emp);
      }
    }

    // 4. Import des Camions
    const truckRepo = this.dataSource.getRepository(Truck);
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

    // 5. Import des Clients
    const clientRepo = this.dataSource.getRepository(Client);
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
}
