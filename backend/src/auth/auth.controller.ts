import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginEmployeeDto } from './dto/login-employee.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('employee/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion employé par Username/Password' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Identifiants incorrects' })
  loginEmployee(@Body() dto: LoginEmployeeDto) {
    return this.authService.loginEmployee(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('employee/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Changer le mot de passe de l\'employé connecté' })
  changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto.newPassword);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion utilisateur back-office' })
  loginUser(@Body() dto: LoginUserDto) {
    return this.authService.loginUser(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('2fa/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Générer le secret TOTP et QR Code 2FA' })
  generate2faSecret(@Request() req: any) {
    return this.authService.generate2faSecret(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activer la 2FA avec le code de vérification' })
  enable2fa(@Request() req: any, @Body('code') code: string) {
    return this.authService.enable2fa(req.user.id, code);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Désactiver la 2FA' })
  disable2fa(@Request() req: any) {
    return this.authService.disable2fa(req.user.id);
  }
}
