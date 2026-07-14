import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductionService } from './production.service';
import { CreateProductionEntryDto } from './dto/create-production-entry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('production')
@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post()
  @ApiOperation({ summary: 'Enregistrer une quantité produite' })
  create(@Body() dto: CreateProductionEntryDto) {
    return this.productionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste de la production, filtrable par mission' })
  findAll(@Query('missionId') missionId?: string) {
    return this.productionService.findAll(missionId);
  }

  @Get('stats/today')
  @ApiOperation({ summary: 'Statistiques de production du jour' })
  getStatsToday() {
    return this.productionService.getProductionStatsToday();
  }
}
