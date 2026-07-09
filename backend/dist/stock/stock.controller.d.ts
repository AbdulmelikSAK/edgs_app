import { StockService } from './stock.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
export declare class StockController {
    private readonly stockService;
    constructor(stockService: StockService);
    createMovement(dto: CreateStockMovementDto): Promise<{
        movement: import("../database/entities/stock-movement.entity").StockMovement;
        alert: boolean;
        currentStock: number;
    }>;
    findByTruck(truckId: string): Promise<import("../database/entities/stock-movement.entity").StockMovement[]>;
    findByMission(missionId: string): Promise<import("../database/entities/stock-movement.entity").StockMovement[]>;
}
