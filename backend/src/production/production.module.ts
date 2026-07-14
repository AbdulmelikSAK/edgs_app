import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionEntry } from '../database/entities/production-entry.entity';
import { Mission } from '../database/entities/mission.entity';
import { Employee } from '../database/entities/employee.entity';
import { ProductionService } from './production.service';
import { ProductionController } from './production.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductionEntry, Mission, Employee])],
  providers: [ProductionService],
  controllers: [ProductionController],
  exports: [ProductionService],
})
export class ProductionModule {}
