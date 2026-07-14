import { Repository } from 'typeorm';
import { Equipment } from '../database/entities/equipment.entity';
import { Truck } from '../database/entities/truck.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
export declare class EquipmentService {
    private readonly equipmentRepo;
    private readonly truckRepo;
    constructor(equipmentRepo: Repository<Equipment>, truckRepo: Repository<Truck>);
    create(dto: CreateEquipmentDto): Promise<Equipment>;
    findAll(): Promise<Equipment[]>;
    findOne(id: string): Promise<Equipment>;
    update(id: string, dto: UpdateEquipmentDto): Promise<Equipment>;
    remove(id: string): Promise<void>;
}
