import { Truck } from './truck.entity';
import { Employee } from './employee.entity';
export declare class TruckAssignment {
    id: string;
    truck: Truck;
    employee: Employee;
    startDate: Date;
    endDate: Date;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
