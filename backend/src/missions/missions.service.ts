import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Mission, MissionStatus } from '../database/entities/mission.entity';
import { Truck } from '../database/entities/truck.entity';
import { Client } from '../database/entities/client.entity';
import { Worksite } from '../database/entities/worksite.entity';
import { Employee } from '../database/entities/employee.entity';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission) private missionRepo: Repository<Mission>,
    @InjectRepository(Truck) private truckRepo: Repository<Truck>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(Worksite) private worksiteRepo: Repository<Worksite>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
  ) {}

  async create(dto: CreateMissionDto): Promise<Mission> {
    const truck = dto.truckId ? await this.truckRepo.findOne({ where: { id: dto.truckId } }) : null;
    const client = dto.clientId ? await this.clientRepo.findOne({ where: { id: dto.clientId } }) : null;
    const worksite = dto.worksiteId ? await this.worksiteRepo.findOne({ where: { id: dto.worksiteId } }) : null;
    
    const employees = dto.employeeIds && dto.employeeIds.length > 0 
      ? await this.employeeRepo.findBy({ id: In(dto.employeeIds) }) 
      : [];
      
    const chefDeMission = dto.chefDeMissionId 
      ? await this.employeeRepo.findOne({ where: { id: dto.chefDeMissionId } }) 
      : null;

    const mission = this.missionRepo.create({
      ...dto,
      truck: truck ?? undefined,
      client: client ?? undefined,
      worksite: worksite ?? undefined,
      employees,
      chefDeMission,
    });
    return this.missionRepo.save(mission);
  }

  findAll(): Promise<Mission[]> {
    return this.missionRepo.find({
      relations: { truck: true, client: true, worksite: true, employees: true, chefDeMission: true },
      order: { scheduledDate: 'DESC' },
    });
  }

  findByTruck(truckId: string): Promise<Mission[]> {
    return this.missionRepo.find({
      where: { truck: { id: truckId }, status: MissionStatus.IN_PROGRESS },
      relations: { truck: true, client: true, worksite: true, employees: true, chefDeMission: true },
    });
  }

  async findOne(id: string): Promise<Mission> {
    const mission = await this.missionRepo.findOne({
      where: { id },
      relations: { truck: true, client: true, worksite: true, employees: true, chefDeMission: true },
    });
    if (!mission) throw new NotFoundException(`Mission ${id} non trouvée`);
    return mission;
  }

  async update(id: string, dto: UpdateMissionDto): Promise<Mission> {
    const mission = await this.findOne(id);
    if (dto.truckId) {
      const truck = await this.truckRepo.findOne({ where: { id: dto.truckId } });
      if (truck) mission.truck = truck;
    }
    if (dto.clientId) {
      const client = await this.clientRepo.findOne({ where: { id: dto.clientId } });
      if (client) mission.client = client;
    }
    if (dto.worksiteId) {
      const worksite = await this.worksiteRepo.findOne({ where: { id: dto.worksiteId } });
      if (worksite) mission.worksite = worksite;
    }
    if (dto.employeeIds) {
      const employees = dto.employeeIds.length > 0 
        ? await this.employeeRepo.findBy({ id: In(dto.employeeIds) }) 
        : [];
      mission.employees = employees;
    }
    if (dto.hasOwnProperty('chefDeMissionId')) {
      const chefDeMission = dto.chefDeMissionId 
        ? await this.employeeRepo.findOne({ where: { id: dto.chefDeMissionId } }) 
        : null;
      mission.chefDeMission = chefDeMission;
    }
    
    const { employeeIds, chefDeMissionId, ...fields } = dto;
    Object.assign(mission, fields);
    return this.missionRepo.save(mission);
  }

  async updateStatus(id: string, status: MissionStatus): Promise<Mission> {
    const mission = await this.findOne(id);
    mission.status = status;
    if (status === MissionStatus.IN_PROGRESS) mission.startedAt = new Date();
    if (status === MissionStatus.COMPLETED) mission.completedAt = new Date();
    return this.missionRepo.save(mission);
  }

  async remove(id: string): Promise<void> {
    await this.missionRepo.delete(id);
  }

  findTodayMissions(truckId: string): Promise<Mission[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.missionRepo.find({
      where: { truck: { id: truckId }, scheduledDate: Between(today, tomorrow) },
      relations: { truck: true, client: true, worksite: true, employees: true, chefDeMission: true },
    });
  }
}
