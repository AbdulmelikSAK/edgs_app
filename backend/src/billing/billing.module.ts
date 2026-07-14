import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quote } from '../database/entities/quote.entity';
import { Invoice } from '../database/entities/invoice.entity';
import { Client } from '../database/entities/client.entity';
import { Mission } from '../database/entities/mission.entity';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Quote, Invoice, Client, Mission])],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
