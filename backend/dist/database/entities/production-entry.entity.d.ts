import { Mission } from './mission.entity';
import { Employee } from './employee.entity';
export declare class ProductionEntry {
    id: string;
    mission: Mission;
    employee: Employee;
    date: Date;
    prestationType: string;
    quantity: number;
    unit: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
