import { Truck } from './truck.entity';
import { Client } from './client.entity';
import { Worksite } from './worksite.entity';
import { Employee } from './employee.entity';
import { SiteSupervisor } from './site-supervisor.entity';
export declare enum MissionStatus {
    PLANNED = "planned",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class Mission {
    id: string;
    title: string;
    type: string;
    clientName: string;
    worksiteAddress: string;
    description: string;
    status: MissionStatus;
    scheduledDate: Date;
    startedAt: Date;
    completedAt: Date;
    estimatedPrice: number;
    actualPrice: number;
    surfaceArea: number;
    estimatedUnit: string;
    actualQuantity: number;
    actualUnit: string;
    totalMaterialCost: number;
    fuelConsumption: number;
    sandBagsUsed: number;
    notes: string;
    truck: Truck;
    client: Client;
    siteSupervisor: SiteSupervisor;
    worksite: Worksite;
    employees: Employee[];
    chefDeMission: Employee | null;
    createdAt: Date;
    updatedAt: Date;
}
