import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Mission, MissionStatus } from '../database/entities/mission.entity';
import { TimeEntry } from '../database/entities/time-entry.entity';
import { StockMovement, StockMovementType } from '../database/entities/stock-movement.entity';
import { Truck } from '../database/entities/truck.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Mission) private missionRepo: Repository<Mission>,
    @InjectRepository(TimeEntry) private timeRepo: Repository<TimeEntry>,
    @InjectRepository(StockMovement) private stockRepo: Repository<StockMovement>,
    @InjectRepository(Truck) private truckRepo: Repository<Truck>,
  ) {}

  async getGlobalStats(from?: string, to?: string) {
    const where: any = {};
    if (from && to) where.scheduledDate = Between(new Date(from), new Date(to));

    const missions = await this.missionRepo.find({ where });
    const completed = missions.filter(m => m.status === MissionStatus.COMPLETED);

    const totalRevenue = completed.reduce((sum, m) => sum + (Number(m.actualPrice) || 0), 0);
    const totalEstimated = completed.reduce((sum, m) => sum + (Number(m.estimatedPrice) || 0), 0);
    const totalSurface = completed.reduce((sum, m) => sum + (Number(m.surfaceArea) || 0), 0);
    const totalFuel = completed.reduce((sum, m) => sum + (Number(m.fuelConsumption) || 0), 0);
    const totalSandBags = completed.reduce((sum, m) => sum + (m.sandBagsUsed || 0), 0);

    const trucks = await this.truckRepo.find({ where: { isActive: true } });

    return {
      missions: {
        total: missions.length,
        completed: completed.length,
        inProgress: missions.filter(m => m.status === MissionStatus.IN_PROGRESS).length,
        planned: missions.filter(m => m.status === MissionStatus.PLANNED).length,
        cancelled: missions.filter(m => m.status === MissionStatus.CANCELLED).length,
      },
      financial: {
        totalRevenue,
        totalEstimated,
        profitability: totalEstimated > 0 ? ((totalRevenue / totalEstimated) * 100).toFixed(1) + '%' : 'N/A',
      },
      operational: {
        totalSurfaceArea: totalSurface,
        totalFuelConsumption: totalFuel,
        totalSandBagsUsed: totalSandBags,
        activeTrucks: trucks.length,
      },
    };
  }

  async getTruckStats(truckId: string) {
    const missions = await this.missionRepo.find({ where: { truck: { id: truckId } } });
    const stockMovements = await this.stockRepo.find({ where: { truck: { id: truckId } } });
    const totalConsumed = stockMovements
      .filter(s => s.type === StockMovementType.CONSUME)
      .reduce((sum, s) => sum + s.quantity, 0);

    return {
      missions: missions.length,
      completed: missions.filter(m => m.status === MissionStatus.COMPLETED).length,
      totalRevenue: missions.reduce((s, m) => s + (Number(m.actualPrice) || 0), 0),
      totalSurface: missions.reduce((s, m) => s + (Number(m.surfaceArea) || 0), 0),
      sandBagsConsumed: totalConsumed,
    };
  }
}
