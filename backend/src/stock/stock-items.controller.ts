import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Res, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockItem } from '../database/entities/stock-item.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';

@ApiTags('stock-items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock-items')
export class StockItemsController {
  constructor(
    @InjectRepository(StockItem) private itemRepo: Repository<StockItem>,
  ) {}

  @Get()
  async findAll(@Res() res: Response) {
    const items = await this.itemRepo.find({ order: { name: 'ASC' } });
    res.setHeader('Content-Range', `stock-items 0-${items.length}/${items.length}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    return res.json(items);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemRepo.findOneBy({ id });
  }

  @Post()
  create(@Body() body: { name: string; unit?: string; quantity?: number; minThreshold?: number; unitPrice?: number }) {
    const item = this.itemRepo.create(body);
    return this.itemRepo.save(item);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { name?: string; unit?: string; quantity?: number; minThreshold?: number; unitPrice?: number }) {
    await this.itemRepo.update(id, body);
    return this.itemRepo.findOneBy({ id });
  }

  @Post(':id/replenish')
  async replenish(@Param('id') id: string, @Body() body: { quantity: number; unitPrice?: number; notes?: string }) {
    const item = await this.itemRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('Article non trouvé');

    const qty = Number(body.quantity) || 0;
    const stockBefore = Number(item.quantity || 0);
    const stockAfter = stockBefore + qty;
    item.quantity = stockAfter;
    if (body.unitPrice !== undefined) {
      item.unitPrice = Number(body.unitPrice);
    }
    await this.itemRepo.save(item);

    return { item, stockBefore, stockAfter };
  }

  @Post(':id/consume')
  async consume(@Param('id') id: string, @Body() body: { quantity: number; missionId?: string; employeeId?: string; notes?: string }) {
    const item = await this.itemRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('Article non trouvé');

    const qty = Math.abs(Number(body.quantity) || 0);
    const stockBefore = Number(item.quantity || 0);
    if (stockBefore < qty) {
      throw new BadRequestException('Stock du dépôt insuffisant');
    }

    const stockAfter = stockBefore - qty;
    item.quantity = stockAfter;
    await this.itemRepo.save(item);

    const alert = stockAfter <= (item.minThreshold || 10);
    return { item, alert, stockBefore, stockAfter, totalCost: qty * (item.unitPrice || 0) };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const item = await this.itemRepo.findOneBy({ id });
    await this.itemRepo.delete(id);
    return item;
  }
}
