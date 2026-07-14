import { Truck } from './truck.entity';
export declare class Equipment {
    id: string;
    name: string;
    serialNumber: string;
    purchaseDate: Date;
    lastMaintenanceDate: Date;
    nextMaintenanceDate: Date;
    status: string;
    assignedTruck: Truck;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
