import { Truck } from './truck.entity';
import { Mission } from './mission.entity';
import { Employee } from './employee.entity';
export declare enum StockMovementType {
    LOAD = "load",
    CONSUME = "consume",
    RETURN = "return",
    ADJUSTMENT = "adjustment"
}
export declare class StockMovement {
    id: string;
    truck: Truck;
    mission: Mission;
    employee: Employee;
    type: StockMovementType;
    quantity: number;
    stockBefore: number;
    stockAfter: number;
    notes: string;
    createdAt: Date;
}
