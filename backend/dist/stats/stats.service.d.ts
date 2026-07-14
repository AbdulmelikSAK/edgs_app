import { Repository } from 'typeorm';
import { Mission } from '../database/entities/mission.entity';
import { TimeEntry } from '../database/entities/time-entry.entity';
import { StockMovement } from '../database/entities/stock-movement.entity';
import { Truck } from '../database/entities/truck.entity';
import { Employee } from '../database/entities/employee.entity';
import { ProductionEntry } from '../database/entities/production-entry.entity';
import { Equipment } from '../database/entities/equipment.entity';
export declare class StatsService {
    private readonly missionRepo;
    private readonly timeRepo;
    private readonly stockRepo;
    private readonly truckRepo;
    private readonly employeeRepo;
    private readonly productionRepo;
    private readonly equipmentRepo;
    constructor(missionRepo: Repository<Mission>, timeRepo: Repository<TimeEntry>, stockRepo: Repository<StockMovement>, truckRepo: Repository<Truck>, employeeRepo: Repository<Employee>, productionRepo: Repository<ProductionEntry>, equipmentRepo: Repository<Equipment>);
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
    getDashboardStats(): Promise<any>;
}
