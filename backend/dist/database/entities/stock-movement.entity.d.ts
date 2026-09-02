import { Truck } from './truck.entity';
import { Mission } from './mission.entity';
import { Employee } from './employee.entity';
import { StockItem } from './stock-item.entity';
export declare enum StockMovementType {
    LOAD = "load",
    CONSUME = "consume",
    RETURN = "return",
    ADJUSTMENT = "adjustment",
    REPLENISH = "replenish"
}
export declare class StockMovement {
    id: string;
    stockItem: StockItem;
    truck: Truck;
    mission: Mission;
    employee: Employee;
    type: StockMovementType;
    quantity: number;
    stockBefore: number;
    stockAfter: number;
    unitPriceAtTime: number;
    notes: string;
    createdAt: Date;
}
