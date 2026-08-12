import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeaveStatus } from '../../database/entities/leave-request.entity';

export class UpdateLeaveRequestStatusDto {
  @ApiProperty({ enum: LeaveStatus, example: LeaveStatus.APPROVED })
  @IsEnum(LeaveStatus)
  status: LeaveStatus;
}
