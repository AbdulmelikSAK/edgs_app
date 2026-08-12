import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginEmployeeDto {
  @ApiProperty({ example: 'cjean' })
  @IsString()
  username: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  password: string;
}
