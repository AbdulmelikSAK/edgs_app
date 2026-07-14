import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TrucksService } from './trucks.service';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('trucks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trucks')
export class TrucksController {
  constructor(private readonly trucksService: TrucksService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un camion' })
  create(@Body() dto: CreateTruckDto) {
    return this.trucksService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des camions' })
  findAll() {
    return this.trucksService.findAll();
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Camions avec stock faible' })
  getLowStock() {
    return this.trucksService.getLowStockTrucks();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trucksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTruckDto) {
    return this.trucksService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trucksService.remove(id);
  }

  @Post('assignments')
  @ApiOperation({ summary: 'Affecter un camion à un chauffeur' })
  assign(
    @Body() body: { truckId: string; employeeId: string; startDate?: string; notes?: string }
  ) {
    return this.trucksService.assignTruck(body.truckId, body.employeeId, body.startDate, body.notes);
  }

  @Post('assignments/:id/end')
  @ApiOperation({ summary: 'Terminer une affectation de camion' })
  unassign(@Param('id') id: string, @Body() body: { endDate?: string }) {
    return this.trucksService.unassignTruck(id, body.endDate);
  }

  @Get('assignments/all')
  @ApiOperation({ summary: 'Liste de toutes les affectations de camions' })
  getAssignments(@Query('truckId') truckId?: string) {
    return this.trucksService.getAssignments(truckId);
  }

  @Get('assignments/search')
  @ApiOperation({ summary: 'Rechercher le conducteur responsable à une date donnée pour les PV' })
  searchDriver(@Query('plateNumber') plateNumber: string, @Query('date') date: string) {
    return this.trucksService.searchDriverByDate(plateNumber, date);
  }
}
