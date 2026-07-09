import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeclockController } from './timeclock.controller';
import { TimeclockService } from './timeclock.service';
import { TimeEntry } from '../database/entities/time-entry.entity';
import { Employee } from '../database/entities/employee.entity';
import { Mission } from '../database/entities/mission.entity';
import { Truck } from '../database/entities/truck.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeEntry, Employee, Mission, Truck])],
  controllers: [TimeclockController],
  providers: [TimeclockService],
  exports: [TimeclockService],
})
export class TimeclockModule {}
