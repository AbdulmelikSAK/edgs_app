import { Repository } from 'typeorm';
import { Truck } from '../database/entities/truck.entity';
import { TruckAssignment } from '../database/entities/truck-assignment.entity';
import { Employee } from '../database/entities/employee.entity';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';
export declare class TrucksService {
    private truckRepo;
    private assignmentRepo;
    private employeeRepo;
    constructor(truckRepo: Repository<Truck>, assignmentRepo: Repository<TruckAssignment>, employeeRepo: Repository<Employee>);
    create(dto: CreateTruckDto): Promise<Truck>;
    findAll(): Promise<Truck[]>;
    findOne(id: string): Promise<Truck>;
    update(id: string, dto: UpdateTruckDto): Promise<Truck>;
    remove(id: string): Promise<void>;
    updateStock(id: string, newStock: number): Promise<Truck>;
    getLowStockTrucks(): Promise<Truck[]>;
    assignTruck(truckId: string, employeeId: string, startDate?: string, notes?: string): Promise<TruckAssignment>;
    unassignTruck(assignmentId: string, endDate?: string): Promise<TruckAssignment>;
    getAssignments(truckId?: string): Promise<TruckAssignment[]>;
    searchDriverByDate(plateNumber: string, dateStr: string): Promise<Employee | null>;
}
