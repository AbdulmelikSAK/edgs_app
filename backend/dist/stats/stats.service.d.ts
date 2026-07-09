import { Repository } from 'typeorm';
import { Mission } from '../database/entities/mission.entity';
import { TimeEntry } from '../database/entities/time-entry.entity';
import { StockMovement } from '../database/entities/stock-movement.entity';
import { Truck } from '../database/entities/truck.entity';
export declare class StatsService {
    private missionRepo;
    private timeRepo;
    private stockRepo;
    private truckRepo;
    constructor(missionRepo: Repository<Mission>, timeRepo: Repository<TimeEntry>, stockRepo: Repository<StockMovement>, truckRepo: Repository<Truck>);
    getGlobalStats(from?: string, to?: string): Promise<{
        missions: {
            total: number;
            completed: number;
            inProgress: number;
            planned: number;
            cancelled: number;
        };
        financial: {
            totalRevenue: number;
            totalEstimated: number;
            profitability: string;
        };
        operational: {
            totalSurfaceArea: number;
            totalFuelConsumption: number;
            totalSandBagsUsed: number;
            activeTrucks: number;
        };
    }>;
    getTruckStats(truckId: string): Promise<{
        missions: number;
        completed: number;
        totalRevenue: number;
        totalSurface: number;
        sandBagsConsumed: number;
    }>;
}
