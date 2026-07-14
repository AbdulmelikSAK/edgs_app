import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../database/entities/equipment.entity';
import { Truck } from '../database/entities/truck.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepo: Repository<Equipment>,
    @InjectRepository(Truck)
    private readonly truckRepo: Repository<Truck>,
  ) {}

  async create(dto: CreateEquipmentDto): Promise<Equipment> {
    const truck = dto.assignedTruckId
      ? await this.truckRepo.findOne({ where: { id: dto.assignedTruckId } })
      : null;

    const equipment = this.equipmentRepo.create({
      name: dto.name,
      serialNumber: dto.serialNumber,
      purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
      lastMaintenanceDate: dto.lastMaintenanceDate ? new Date(dto.lastMaintenanceDate) : undefined,
      nextMaintenanceDate: dto.nextMaintenanceDate ? new Date(dto.nextMaintenanceDate) : undefined,
      status: dto.status ?? 'Disponible',
      notes: dto.notes,
      assignedTruck: truck ?? undefined,
    });

    return this.equipmentRepo.save(equipment);
  }

  async findAll(): Promise<Equipment[]> {
    return this.equipmentRepo.find({
      relations: { assignedTruck: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Equipment> {
    const equipment = await this.equipmentRepo.findOne({
      where: { id },
      relations: { assignedTruck: true },
    });
    if (!equipment) throw new NotFoundException(`Équipement ${id} non trouvé`);
    return equipment;
  }

  async update(id: string, dto: UpdateEquipmentDto): Promise<Equipment> {
    const equipment = await this.findOne(id);

    if (dto.assignedTruckId !== undefined) {
      if (dto.assignedTruckId === null) {
        equipment.assignedTruck = null as any;
      } else {
        const truck = await this.truckRepo.findOne({ where: { id: dto.assignedTruckId } });
        if (!truck) throw new NotFoundException('Camion non trouvé');
        equipment.assignedTruck = truck;
      }
    }

    if (dto.name !== undefined) equipment.name = dto.name;
    if (dto.serialNumber !== undefined) equipment.serialNumber = dto.serialNumber;
    if (dto.purchaseDate !== undefined)
      equipment.purchaseDate = dto.purchaseDate ? new Date(dto.purchaseDate) : (null as any);
    if (dto.lastMaintenanceDate !== undefined)
      equipment.lastMaintenanceDate = dto.lastMaintenanceDate
        ? new Date(dto.lastMaintenanceDate)
        : (null as any);
    if (dto.nextMaintenanceDate !== undefined)
      equipment.nextMaintenanceDate = dto.nextMaintenanceDate
        ? new Date(dto.nextMaintenanceDate)
        : (null as any);
    if (dto.status !== undefined) equipment.status = dto.status;
    if (dto.notes !== undefined) equipment.notes = dto.notes;

    return this.equipmentRepo.save(equipment);
  }

  async remove(id: string): Promise<void> {
    const equipment = await this.findOne(id);
    await this.equipmentRepo.remove(equipment);
  }
}
