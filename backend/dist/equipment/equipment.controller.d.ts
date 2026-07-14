import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
export declare class EquipmentController {
    private readonly equipmentService;
    constructor(equipmentService: EquipmentService);
    create(dto: CreateEquipmentDto): Promise<import("../database/entities/equipment.entity").Equipment>;
    findAll(): Promise<import("../database/entities/equipment.entity").Equipment[]>;
    findOne(id: string): Promise<import("../database/entities/equipment.entity").Equipment>;
    update(id: string, dto: UpdateEquipmentDto): Promise<import("../database/entities/equipment.entity").Equipment>;
    remove(id: string): Promise<void>;
}
