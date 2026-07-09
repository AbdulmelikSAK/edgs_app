import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginPinDto {
  @ApiProperty({ description: 'Code PIN 4-6 chiffres', example: '1234' })
  @IsString()
  @Length(4, 6)
  pin: string;
}
