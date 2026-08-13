import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeaveRequestsService } from './leave-requests.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestStatusDto } from './dto/update-leave-request-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('leave-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leave-requests')
export class LeaveRequestsController {
  constructor(private readonly leaveService: LeaveRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Soumettre une demande de congé' })
  create(@Body() dto: CreateLeaveRequestDto) {
    return this.leaveService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir toutes les demandes de congés' })
  findAll() {
    return this.leaveService.findAll();
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: "Obtenir les demandes de congés d'un employé" })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.leaveService.findByEmployee(employeeId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: "Mettre à jour le statut d'une demande" })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveRequestStatusDto,
  ) {
    return this.leaveService.updateStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une demande de congé' })
  remove(@Param('id') id: string) {
    return this.leaveService.remove(id);
  }
}
