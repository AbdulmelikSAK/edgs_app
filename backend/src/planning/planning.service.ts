import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { WeeklyPlanning } from '../database/entities/weekly-planning.entity';
import { Mission } from '../database/entities/mission.entity';
import { Employee } from '../database/entities/employee.entity';
import { CreatePlanningDto } from './dto/create-planning.dto';

@Injectable()
export class PlanningService {
  constructor(
    @InjectRepository(WeeklyPlanning) private planningRepo: Repository<WeeklyPlanning>,
    @InjectRepository(Mission) private missionRepo: Repository<Mission>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
  ) { }

  async create(dto: CreatePlanningDto): Promise<WeeklyPlanning> {
    const mission = await this.missionRepo.findOne({ where: { id: dto.missionId } });
    
    const employees = dto.employeeIds && dto.employeeIds.length > 0
      ? await this.employeeRepo.findBy({ id: In(dto.employeeIds) })
      : [];

    const entry = this.planningRepo.create({
      ...dto,
      mission: mission!,
      employees,
    });
    return this.planningRepo.save(entry);
  }

  findByWeek(year: number, week: number): Promise<WeeklyPlanning[]> {
    return this.planningRepo.find({
      where: { year, week },
      relations: {
        mission: {
          client: true,
          worksite: true,
          truck: true,
        },
        employees: true,
      },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async remove(id: string): Promise<void> {
    await this.planningRepo.delete(id);
  }
}
