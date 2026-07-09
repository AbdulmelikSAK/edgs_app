import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { StockMovementType } from '../../database/entities/stock-movement.entity';

export class CreateStockMovementDto {
  @ApiProperty()
  @IsUUID()
  truckId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  missionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiProperty({ enum: StockMovementType })
  @IsEnum(StockMovementType)
  type: StockMovementType;

  @ApiProperty({ example: 5, description: 'Nombre de sacs' })
  @IsInt()
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
