import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, RoleName } from './entities/role.entity';
import { User } from './entities/user.entity';
import { Employee } from './entities/employee.entity';
import { Truck } from './entities/truck.entity';
import { Client } from './entities/client.entity';
import { Worksite } from './entities/worksite.entity';
import { Mission, MissionStatus } from './entities/mission.entity';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  constructor(private dataSource: DataSource) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    const roleRepo = this.dataSource.getRepository(Role);
    const count = await roleRepo.count();
    if (count > 0) {
      console.log('Database already has data. Skipping seeding.');
      return;
    }

    console.log('🌱 Seeding database...');

    // 1. Roles
    const roles: Role[] = [];
    for (const name of Object.values(RoleName)) {
      const role = roleRepo.create({
        name,
        description: `${name} role`,
      });
      roles.push(await roleRepo.save(role));
    }

    const adminRole = roles.find((r) => r.name === RoleName.ADMIN)!;
    const managerRole = roles.find((r) => r.name === RoleName.MANAGER)!;
    const driverRole = roles.find((r) => r.name === RoleName.DRIVER)!;

    // 2. Users (Backoffice logins)
    const userRepo = this.dataSource.getRepository(User);
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

    // 3. Employees (Mobile app logins)
    const employeeRepo = this.dataSource.getRepository(Employee);
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

    // 4. Trucks
    const truckRepo = this.dataSource.getRepository(Truck);
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

    // 5. Clients
    const clientRepo = this.dataSource.getRepository(Client);
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

    // 6. Worksites
    const worksiteRepo = this.dataSource.getRepository(Worksite);
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

    // 7. Missions
    const missionRepo = this.dataSource.getRepository(Mission);
    const today = new Date();
    const mission1 = missionRepo.create({
      title: 'Sablage Façade Paris',
      description: 'Sablage de la façade principale, grain moyen.',
      scheduledDate: today,
      status: MissionStatus.PLANNED,
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
      status: MissionStatus.IN_PROGRESS,
      client: client2,
      worksite: worksite2,
      truck: truck2,
      notes: 'Buse de sablage numéro 8.',
      startedAt: new Date(today.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    });
    await missionRepo.save(mission2);

    console.log('✅ Seeding completed.');
  }
}
