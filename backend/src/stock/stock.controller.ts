import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('stock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('movement')
  createMovement(@Body() dto: CreateStockMovementDto) {
    return this.stockService.createMovement(dto);
  }

  @Get('truck/:truckId')
  findByTruck(@Param('truckId') truckId: string) {
    return this.stockService.findByTruck(truckId);
  }

  @Get('mission/:missionId')
  findByMission(@Param('missionId') missionId: string) {
    return this.stockService.findByMission(missionId);
  }
}
