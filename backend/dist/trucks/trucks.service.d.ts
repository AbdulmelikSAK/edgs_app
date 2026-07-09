import { Repository } from 'typeorm';
import { Truck } from '../database/entities/truck.entity';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';
export declare class TrucksService {
    private truckRepo;
    constructor(truckRepo: Repository<Truck>);
    create(dto: CreateTruckDto): Promise<Truck>;
    findAll(): Promise<Truck[]>;
    findOne(id: string): Promise<Truck>;
    update(id: string, dto: UpdateTruckDto): Promise<Truck>;
    remove(id: string): Promise<void>;
    updateStock(id: string, newStock: number): Promise<Truck>;
    getLowStockTrucks(): Promise<Truck[]>;
}
