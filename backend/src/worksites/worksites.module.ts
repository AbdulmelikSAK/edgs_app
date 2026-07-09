import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorksitesController } from './worksites.controller';
import { WorksitesService } from './worksites.service';
import { Worksite } from '../database/entities/worksite.entity';
import { Client } from '../database/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Worksite, Client])],
  controllers: [WorksitesController],
  providers: [WorksitesService],
  exports: [WorksitesService],
})
export class WorksitesModule {}
