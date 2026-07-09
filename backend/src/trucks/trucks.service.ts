import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Truck } from '../database/entities/truck.entity';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';

@Injectable()
export class TrucksService {
  constructor(
    @InjectRepository(Truck)
    private truckRepo: Repository<Truck>,
  ) {}

  create(dto: CreateTruckDto): Promise<Truck> {
    const truck = this.truckRepo.create(dto);
    return this.truckRepo.save(truck);
  }

  findAll(): Promise<Truck[]> {
    return this.truckRepo.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<Truck> {
    const truck = await this.truckRepo.findOne({ where: { id } });
    if (!truck) throw new NotFoundException(`Camion ${id} non trouvé`);
    return truck;
  }

  async update(id: string, dto: UpdateTruckDto): Promise<Truck> {
    const truck = await this.findOne(id);
    Object.assign(truck, dto);
    return this.truckRepo.save(truck);
  }

  async remove(id: string): Promise<void> {
    const truck = await this.findOne(id);
    truck.isActive = false;
    await this.truckRepo.save(truck);
  }

  async updateStock(id: string, newStock: number): Promise<Truck> {
    const truck = await this.findOne(id);
    truck.currentStock = newStock;
    return this.truckRepo.save(truck);
  }

  async getLowStockTrucks(): Promise<Truck[]> {
    return this.truckRepo
      .createQueryBuilder('truck')
      .where('truck.isActive = true')
      .andWhere('truck.currentStock <= truck.stockAlertThreshold')
      .getMany();
  }
}
