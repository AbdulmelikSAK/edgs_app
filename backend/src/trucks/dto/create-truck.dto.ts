import { IsString, IsOptional, IsInt, IsPositive, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTruckDto {
  @ApiProperty({ example: 'AB-123-CD' })
  @IsString()
  plateNumber: string;

  @ApiPropertyOptional({ example: '1212' })
  @IsOptional()
  @IsString()
  pinCode?: string;

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

  @ApiPropertyOptional({ example: 45000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  mileage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insuranceExpirationDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  controlTechniqueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastServiceDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  registrationCardUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insuranceCardUrl?: string;
}
