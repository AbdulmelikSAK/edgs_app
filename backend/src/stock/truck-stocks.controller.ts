import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TruckStock } from '../database/entities/truck-stock.entity';
import { Truck } from '../database/entities/truck.entity';
import { StockItem } from '../database/entities/stock-item.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';
import { CreateTruckStockDto } from './dto/create-truck-stock.dto';
import { UpdateTruckStockDto } from './dto/update-truck-stock.dto';

@ApiTags('truck-stocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('truck-stocks')
export class TruckStocksController {
  constructor(
    @InjectRepository(TruckStock) private tsRepo: Repository<TruckStock>,
    @InjectRepository(Truck) private truckRepo: Repository<Truck>,
    @InjectRepository(StockItem) private itemRepo: Repository<StockItem>,
  ) {}

  @Get()
  async findAll(@Res() res: Response) {
    const list = await this.tsRepo.find({
      relations: { truck: true, stockItem: true },
      order: { truck: { plateNumber: 'ASC' } },
    });
    res.setHeader(
      'Content-Range',
      `truck-stocks 0-${list.length}/${list.length}`,
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    return res.json(list);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tsRepo.findOne({
      where: { id },
      relations: { truck: true, stockItem: true },
    });
  }

  @Post()
  async create(@Body() dto: CreateTruckStockDto) {
    const truck = await this.truckRepo.findOneBy({ id: dto.truckId });
    if (!truck) throw new NotFoundException(`Camion ${dto.truckId} non trouvé`);

    const stockItem = await this.itemRepo.findOneBy({ id: dto.stockItemId });
    if (!stockItem)
      throw new NotFoundException(
        `Article de stock ${dto.stockItemId} non trouvé`,
      );

    // Check if relation already exists, if so update it
    let ts = await this.tsRepo.findOne({
      where: { truck: { id: dto.truckId }, stockItem: { id: dto.stockItemId } },
    });
    if (ts) {
      ts.quantity = dto.quantity;
    } else {
      ts = new TruckStock();
      ts.truck = truck;
      ts.stockItem = stockItem;
      ts.quantity = dto.quantity;
    }
    return this.tsRepo.save(ts);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTruckStockDto) {
    const ts = await this.tsRepo.findOneBy({ id });
    if (!ts) throw new NotFoundException(`Stock camion ${id} non trouvé`);

    await this.tsRepo.update(id, { quantity: dto.quantity });
    return this.tsRepo.findOne({
      where: { id },
      relations: { truck: true, stockItem: true },
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const ts = await this.tsRepo.findOneBy({ id });
    await this.tsRepo.delete(id);
    return ts;
  }
}
