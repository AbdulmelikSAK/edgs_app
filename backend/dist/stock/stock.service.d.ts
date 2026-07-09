import { Repository } from 'typeorm';
import { StockMovement } from '../database/entities/stock-movement.entity';
import { Truck } from '../database/entities/truck.entity';
import { Mission } from '../database/entities/mission.entity';
import { Employee } from '../database/entities/employee.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
export declare class StockService {
    private stockRepo;
    private truckRepo;
    private missionRepo;
    private employeeRepo;
    constructor(stockRepo: Repository<StockMovement>, truckRepo: Repository<Truck>, missionRepo: Repository<Mission>, employeeRepo: Repository<Employee>);
    createMovement(dto: CreateStockMovementDto): Promise<{
        movement: StockMovement;
        alert: boolean;
        currentStock: number;
    }>;
    findByTruck(truckId: string): Promise<StockMovement[]>;
    findByMission(missionId: string): Promise<StockMovement[]>;
}
