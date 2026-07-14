import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';
import { Truck } from '../database/entities/truck.entity';
import { TruckAssignment } from '../database/entities/truck-assignment.entity';
import { Employee } from '../database/entities/employee.entity';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';

@Injectable()
export class TrucksService {
  constructor(
    @InjectRepository(Truck)
    private truckRepo: Repository<Truck>,
    @InjectRepository(TruckAssignment)
    private assignmentRepo: Repository<TruckAssignment>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
  ) {}

  create(dto: CreateTruckDto): Promise<Truck> {
    const truck = this.truckRepo.create(dto);
    return this.truckRepo.save(truck);
  }

  findAll(): Promise<Truck[]> {
    return this.truckRepo.find({
      where: { isActive: true },
      relations: { stocks: { stockItem: true } },
      order: { plateNumber: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Truck> {
    const truck = await this.truckRepo.findOne({
      where: { id },
      relations: { stocks: { stockItem: true } }
    });
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

  async assignTruck(truckId: string, employeeId: string, startDate?: string, notes?: string): Promise<TruckAssignment> {
    const truck = await this.findOne(truckId);
    const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employé non trouvé');

    // Close any previous active assignment for this truck
    const activeTruckAss = await this.assignmentRepo.findOne({
      where: { truck: { id: truckId }, endDate: IsNull() }
    });
    if (activeTruckAss) {
      activeTruckAss.endDate = new Date();
      await this.assignmentRepo.save(activeTruckAss);
    }

    // Close any previous active assignment for this employee
    const activeEmpAss = await this.assignmentRepo.findOne({
      where: { employee: { id: employeeId }, endDate: IsNull() }
    });
    if (activeEmpAss) {
      activeEmpAss.endDate = new Date();
      await this.assignmentRepo.save(activeEmpAss);
    }

    const assignment = this.assignmentRepo.create({
      truck,
      employee,
      startDate: startDate ? new Date(startDate) : new Date(),
      notes,
    });

    return this.assignmentRepo.save(assignment);
  }

  async unassignTruck(assignmentId: string, endDate?: string): Promise<TruckAssignment> {
    const ass = await this.assignmentRepo.findOne({ where: { id: assignmentId } });
    if (!ass) throw new NotFoundException('Affectation non trouvée');
    ass.endDate = endDate ? new Date(endDate) : new Date();
    return this.assignmentRepo.save(ass);
  }

  async getAssignments(truckId?: string): Promise<TruckAssignment[]> {
    if (truckId) {
      return this.assignmentRepo.find({
        where: { truck: { id: truckId } },
        relations: { truck: true, employee: true },
        order: { startDate: 'DESC' }
      });
    }
    return this.assignmentRepo.find({
      relations: { truck: true, employee: true },
      order: { startDate: 'DESC' }
    });
  }

  async searchDriverByDate(plateNumber: string, dateStr: string): Promise<Employee | null> {
    const date = new Date(dateStr);

    // Find assignment where startDate <= date AND (endDate >= date OR endDate IS NULL)
    const ass = await this.assignmentRepo.findOne({
      where: [
        {
          truck: { plateNumber },
          startDate: LessThanOrEqual(date),
          endDate: MoreThanOrEqual(date)
        },
        {
          truck: { plateNumber },
          startDate: LessThanOrEqual(date),
          endDate: IsNull()
        }
      ],
      relations: { employee: true }
    });

    return ass ? ass.employee : null;
  }
}
