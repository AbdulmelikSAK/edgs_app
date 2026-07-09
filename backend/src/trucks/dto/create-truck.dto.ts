import { IsString, IsOptional, IsInt, IsPositive, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTruckDto {
  @ApiProperty({ example: 'AB-123-CD' })
  @IsString()
  plateNumber: string;

  @ApiPropertyOptional({ example: 'Mercedes Actros' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 2020 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  currentStock?: number;

  @ApiPropertyOptional({ example: 10, description: 'Seuil alerte stock' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stockAlertThreshold?: number;
}
