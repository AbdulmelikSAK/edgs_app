import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    getDashboard(): Promise<any>;
    getGlobal(from?: string, to?: string): Promise<{
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
    getTruck(id: string): Promise<{
        missions: number;
        completed: number;
        totalRevenue: number;
        totalSurface: number;
        sandBagsConsumed: number;
    }>;
}
