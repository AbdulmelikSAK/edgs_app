import { Truck } from './truck.entity';
import { Client } from './client.entity';
import { Worksite } from './worksite.entity';
export declare enum MissionStatus {
    PLANNED = "planned",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class Mission {
    id: string;
    title: string;
    description: string;
    status: MissionStatus;
    scheduledDate: Date;
    startedAt: Date;
    completedAt: Date;
    estimatedPrice: number;
    actualPrice: number;
    surfaceArea: number;
    fuelConsumption: number;
    sandBagsUsed: number;
    notes: string;
    truck: Truck;
    client: Client;
    worksite: Worksite;
    createdAt: Date;
    updatedAt: Date;
}
