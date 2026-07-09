import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Res } from '@nestjs/common';
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
  create(@Body() body: { name: string; unit?: string }) {
    const item = this.itemRepo.create(body);
    return this.itemRepo.save(item);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { name?: string; unit?: string }) {
    await this.itemRepo.update(id, body);
    return this.itemRepo.findOneBy({ id });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const item = await this.itemRepo.findOneBy({ id });
    await this.itemRepo.delete(id);
    return item;
  }
}
