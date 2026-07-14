import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TimeEntry, TimeEntryType } from '../database/entities/time-entry.entity';
import { Employee } from '../database/entities/employee.entity';
import { Mission } from '../database/entities/mission.entity';
import { Truck } from '../database/entities/truck.entity';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';

@Injectable()
export class TimeclockService {
  constructor(
    @InjectRepository(TimeEntry) private timeEntryRepo: Repository<TimeEntry>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    @InjectRepository(Mission) private missionRepo: Repository<Mission>,
    @InjectRepository(Truck) private truckRepo: Repository<Truck>,
  ) {}

  async createEntry(dto: CreateTimeEntryDto): Promise<TimeEntry> {
    const employee = await this.employeeRepo.findOne({ where: { id: dto.employeeId } });
    if (!employee) throw new NotFoundException('Employé non trouvé');
    const mission = dto.missionId ? await this.missionRepo.findOne({ where: { id: dto.missionId } }) : null;
    const truck = dto.truckId ? await this.truckRepo.findOne({ where: { id: dto.truckId } }) : null;

    const entry = this.timeEntryRepo.create({
      employee,
      mission: mission ?? undefined,
      truck: truck ?? undefined,
      type: dto.type,
      timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      latitude: dto.latitude,
      longitude: dto.longitude,
      notes: dto.notes,
      displacementMode: dto.displacementMode,
      signature: dto.signature,
      isOutOfZone: dto.isOutOfZone ?? false,
      isSyncedFromOffline: dto.isSyncedFromOffline ?? false,
    });
    return this.timeEntryRepo.save(entry);
  }

  async syncBatch(entries: CreateTimeEntryDto[]): Promise<TimeEntry[]> {
    const results: TimeEntry[] = [];
    for (const dto of entries) {
      dto.isSyncedFromOffline = true;
      results.push(await this.createEntry(dto));
    }
    return results;
  }

  findByEmployee(employeeId: string, date?: string): Promise<TimeEntry[]> {
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return this.timeEntryRepo.find({
        where: { employee: { id: employeeId }, timestamp: Between(start, end) },
        order: { timestamp: 'ASC' },
      });
    }
    return this.timeEntryRepo.find({
      where: { employee: { id: employeeId } },
      order: { timestamp: 'DESC' },
      take: 50,
    });
  }

  findByMission(missionId: string): Promise<TimeEntry[]> {
    return this.timeEntryRepo.find({
      where: { mission: { id: missionId } },
      relations: { employee: true },
      order: { timestamp: 'ASC' },
    });
  }
}
