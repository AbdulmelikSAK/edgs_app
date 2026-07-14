import { TrucksService } from './trucks.service';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';
export declare class TrucksController {
    private readonly trucksService;
    constructor(trucksService: TrucksService);
    create(dto: CreateTruckDto): Promise<import("../database/entities/truck.entity").Truck>;
    findAll(): Promise<import("../database/entities/truck.entity").Truck[]>;
    getLowStock(): Promise<import("../database/entities/truck.entity").Truck[]>;
    findOne(id: string): Promise<import("../database/entities/truck.entity").Truck>;
    update(id: string, dto: UpdateTruckDto): Promise<import("../database/entities/truck.entity").Truck>;
    remove(id: string): Promise<void>;
    assign(body: {
        truckId: string;
        employeeId: string;
        startDate?: string;
        notes?: string;
    }): Promise<import("../database/entities/truck-assignment.entity").TruckAssignment>;
    unassign(id: string, body: {
        endDate?: string;
    }): Promise<import("../database/entities/truck-assignment.entity").TruckAssignment>;
    getAssignments(truckId?: string): Promise<import("../database/entities/truck-assignment.entity").TruckAssignment[]>;
    searchDriver(plateNumber: string, date: string): Promise<import("../database/entities/employee.entity").Employee | null>;
}
