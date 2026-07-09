import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Jean' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Code PIN 4-6 chiffres', example: '1234' })
  @IsString()
  @Length(4, 6)
  pin: string;

  @ApiPropertyOptional({ example: 'EMP001' })
  @IsOptional()
  @IsString()
  badgeNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roleId?: string;
}
