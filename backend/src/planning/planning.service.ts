import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeeklyPlanning } from '../database/entities/weekly-planning.entity';
import { Mission } from '../database/entities/mission.entity';
import { Truck } from '../database/entities/truck.entity';
import { CreatePlanningDto } from './dto/create-planning.dto';

@Injectable()
export class PlanningService {
  constructor(
    @InjectRepository(WeeklyPlanning) private planningRepo: Repository<WeeklyPlanning>,
    @InjectRepository(Mission) private missionRepo: Repository<Mission>,
    @InjectRepository(Truck) private truckRepo: Repository<Truck>,
  ) {}

  async create(dto: CreatePlanningDto): Promise<WeeklyPlanning> {
    const mission = await this.missionRepo.findOne({ where: { id: dto.missionId } });
    const truck = dto.truckId ? await this.truckRepo.findOne({ where: { id: dto.truckId } }) : null;
    const entry = this.planningRepo.create({
      ...dto,
      mission: mission!,
      truck: truck ?? undefined,
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
        },
        truck: true,
      },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async remove(id: string): Promise<void> {
    await this.planningRepo.delete(id);
  }
}
