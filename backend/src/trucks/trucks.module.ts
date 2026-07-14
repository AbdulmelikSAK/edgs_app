import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Truck } from '../database/entities/truck.entity';
import { TruckAssignment } from '../database/entities/truck-assignment.entity';
import { Employee } from '../database/entities/employee.entity';
import { TrucksService } from './trucks.service';
import { TrucksController } from './trucks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Truck, TruckAssignment, Employee])],
  controllers: [TrucksController],
  providers: [TrucksService],
  exports: [TrucksService],
})
export class TrucksModule {}
