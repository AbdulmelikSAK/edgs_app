import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WorksitesService } from './worksites.service';
import { CreateWorksiteDto } from './dto/create-worksite.dto';
import { UpdateWorksiteDto } from './dto/update-worksite.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('worksites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('worksites')
export class WorksitesController {
  constructor(private readonly worksitesService: WorksitesService) {}

  @Post()
  create(@Body() dto: CreateWorksiteDto) {
    return this.worksitesService.create(dto);
  }

  @Get()
  findAll() {
    return this.worksitesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.worksitesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorksiteDto) {
    return this.worksitesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.worksitesService.remove(id);
  }
}
