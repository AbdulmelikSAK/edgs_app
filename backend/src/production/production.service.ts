import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionEntry } from '../database/entities/production-entry.entity';
import { Mission } from '../database/entities/mission.entity';
import { Employee } from '../database/entities/employee.entity';
import { CreateProductionEntryDto } from './dto/create-production-entry.dto';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(ProductionEntry)
    private readonly productionRepo: Repository<ProductionEntry>,
    @InjectRepository(Mission)
    private readonly missionRepo: Repository<Mission>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async create(dto: CreateProductionEntryDto): Promise<ProductionEntry> {
    const mission = await this.missionRepo.findOne({ where: { id: dto.missionId } });
    if (!mission) throw new NotFoundException('Mission non trouvée');

    const employee = dto.employeeId
      ? await this.employeeRepo.findOne({ where: { id: dto.employeeId } })
      : null;

    const entry = this.productionRepo.create({
      mission,
      employee: employee ?? undefined,
      date: dto.date ? new Date(dto.date) : new Date(),
      prestationType: dto.prestationType,
      quantity: dto.quantity,
      unit: dto.unit,
      notes: dto.notes,
    });

    const saved = await this.productionRepo.save(entry);

    // Update mission actual surface area progress if applicable
    const allProductionForMission = await this.productionRepo.find({
      where: { mission: { id: mission.id } },
    });
    const totalQty = allProductionForMission.reduce((sum, p) => sum + Number(p.quantity), 0);
    mission.surfaceArea = totalQty;
    await this.missionRepo.save(mission);

    return saved;
  }

  async findAll(missionId?: string): Promise<ProductionEntry[]> {
    if (missionId) {
      return this.productionRepo.find({
        where: { mission: { id: missionId } },
        relations: { employee: true, mission: true },
        order: { date: 'DESC' },
      });
    }
    return this.productionRepo.find({
      relations: { employee: true, mission: true },
      order: { date: 'DESC' },
    });
  }

  async getProductionStatsToday(): Promise<any> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const entriesToday = await this.productionRepo
      .createQueryBuilder('p')
      .where('p.date BETWEEN :start AND :end', { start, end })
      .getMany();

    const statsByType: { [key: string]: number } = {};
    let total = 0;

    entriesToday.forEach((entry) => {
      const type = entry.prestationType || 'Autre';
      const qty = Number(entry.quantity);
      statsByType[type] = (statsByType[type] || 0) + qty;
      total += qty;
    });

    return {
      total,
      breakdown: Object.keys(statsByType).map((name) => ({
        name,
        quantity: statsByType[name],
        percentage: total > 0 ? Math.round((statsByType[name] / total) * 100) : 0,
      })),
    };
  }
}
