import { IsString, IsOptional, Length, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Jean' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'jdupont' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ example: 3000.00 })
  @IsOptional()
  @IsNumber()
  monthlySalary?: number;

  @ApiPropertyOptional({ example: 25.00 })
  @IsOptional()
  @IsNumber()
  paidLeaveBalance?: number;

  @ApiPropertyOptional({ example: 30.00 })
  @IsOptional()
  @IsNumber()
  paidLeaveN?: number;

  @ApiPropertyOptional({ example: 0.00 })
  @IsOptional()
  @IsNumber()
  paidLeaveN1?: number;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsString()
  hireDate?: string;

  @ApiPropertyOptional({ example: 10.00 })
  @IsOptional()
  @IsNumber()
  rttBalance?: number;

  @ApiPropertyOptional({ example: 'EMP001' })
  @IsOptional()
  @IsString()
  badgeNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roleId?: string;

  @ApiPropertyOptional({ example: 35.00 })
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @ApiPropertyOptional({ example: '0612345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'jean@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'Chef de chantier' })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documents?: string;
}
