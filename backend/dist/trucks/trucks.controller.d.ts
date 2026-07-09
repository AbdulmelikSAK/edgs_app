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
}
