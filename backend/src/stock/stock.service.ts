import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement, StockMovementType } from '../database/entities/stock-movement.entity';
import { Truck } from '../database/entities/truck.entity';
import { Mission } from '../database/entities/mission.entity';
import { Employee } from '../database/entities/employee.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockMovement) private stockRepo: Repository<StockMovement>,
    @InjectRepository(Truck) private truckRepo: Repository<Truck>,
    @InjectRepository(Mission) private missionRepo: Repository<Mission>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
  ) {}

  async createMovement(dto: CreateStockMovementDto): Promise<{ movement: StockMovement; alert: boolean; currentStock: number }> {
    const truck = await this.truckRepo.findOne({ where: { id: dto.truckId } });
    if (!truck) throw new NotFoundException('Camion non trouvé');
    const mission = dto.missionId ? await this.missionRepo.findOne({ where: { id: dto.missionId } }) : null;
    const employee = dto.employeeId ? await this.employeeRepo.findOne({ where: { id: dto.employeeId } }) : null;

    const stockBefore = truck.currentStock;
    let stockAfter = stockBefore;

    if (dto.type === StockMovementType.LOAD || dto.type === StockMovementType.ADJUSTMENT) {
      stockAfter = stockBefore + dto.quantity;
    } else if (dto.type === StockMovementType.CONSUME || dto.type === StockMovementType.RETURN) {
      stockAfter = stockBefore - Math.abs(dto.quantity);
    }

    if (stockAfter < 0) throw new BadRequestException('Stock insuffisant');

    truck.currentStock = stockAfter;
    await this.truckRepo.save(truck);

    const movement = this.stockRepo.create({
      truck,
      mission: mission ?? undefined,
      employee: employee ?? undefined,
      type: dto.type,
      quantity: dto.quantity,
      stockBefore,
      stockAfter,
      notes: dto.notes,
    });
    await this.stockRepo.save(movement);

    const alert = stockAfter <= truck.stockAlertThreshold;
    return { movement, alert, currentStock: stockAfter };
  }

  findByTruck(truckId: string): Promise<StockMovement[]> {
    return this.stockRepo.find({
      where: { truck: { id: truckId } },
      relations: { mission: true, employee: true },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  findByMission(missionId: string): Promise<StockMovement[]> {
    return this.stockRepo.find({
      where: { mission: { id: missionId } },
      relations: { truck: true, employee: true },
      order: { createdAt: 'ASC' },
    });
  }
}
