import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { StockMovement } from '../database/entities/stock-movement.entity';
import { Truck } from '../database/entities/truck.entity';
import { Mission } from '../database/entities/mission.entity';
import { Employee } from '../database/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockMovement, Truck, Mission, Employee])],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
