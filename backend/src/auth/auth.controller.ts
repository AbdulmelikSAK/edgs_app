import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginPinDto } from './dto/login-pin.dto';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('pin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion employe par code PIN' })
  @ApiResponse({ status: 200, description: 'Connexion reussie' })
  @ApiResponse({ status: 401, description: 'PIN incorrect' })
  loginWithPin(@Body() dto: LoginPinDto) {
    return this.authService.loginWithPin(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion utilisateur back-office' })
  loginUser(@Body() dto: LoginUserDto) {
    return this.authService.loginUser(dto);
  }
}
