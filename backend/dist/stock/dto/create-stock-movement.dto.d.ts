import { StockMovementType } from '../../database/entities/stock-movement.entity';
export declare class CreateStockMovementDto {
    truckId: string;
    missionId?: string;
    employeeId?: string;
    type: StockMovementType;
    quantity: number;
    notes?: string;
}
