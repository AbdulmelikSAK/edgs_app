import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockController } from './stock.controller';
import { StockItemsController } from './stock-items.controller';
import { TruckStocksController } from './truck-stocks.controller';
import { StockService } from './stock.service';
import { StockMovement } from '../database/entities/stock-movement.entity';
import { Truck } from '../database/entities/truck.entity';
import { Mission } from '../database/entities/mission.entity';
import { Employee } from '../database/entities/employee.entity';
import { StockItem } from '../database/entities/stock-item.entity';
import { TruckStock } from '../database/entities/truck-stock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockMovement, Truck, Mission, Employee, StockItem, TruckStock])],
  controllers: [StockController, StockItemsController, TruckStocksController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
