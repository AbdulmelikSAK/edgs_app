import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveType } from '../../database/entities/leave-request.entity';

export class CreateLeaveRequestDto {
  @ApiProperty({ example: 'employee-uuid' })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ enum: LeaveType, example: LeaveType.CONGE })
  @IsEnum(LeaveType)
  type: LeaveType;

  @ApiProperty({ example: '2026-08-15T08:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-08-20T18:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isHalfDay?: boolean;

  @ApiPropertyOptional({ example: 'Vacances d\'été' })
  @IsOptional()
  @IsString()
  reason?: string;
}
