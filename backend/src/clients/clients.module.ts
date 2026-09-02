import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { Client } from '../database/entities/client.entity';
import { ClientContact } from '../database/entities/client-contact.entity';
import { SiteSupervisor } from '../database/entities/site-supervisor.entity';
import { SeederService } from '../database/seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Client, ClientContact, SiteSupervisor])],
  controllers: [ClientsController],
  providers: [ClientsService, SeederService],
  exports: [ClientsService],
})
export class ClientsModule {}
