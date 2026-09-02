import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee } from '../database/entities/employee.entity';
import { User } from '../database/entities/user.entity';
import { LoginEmployeeDto } from './dto/login-employee.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { TotpUtils } from './totp.utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async loginEmployee(dto: LoginEmployeeDto) {
    const emp = await this.employeeRepo.findOne({
      where: { username: dto.username, isActive: true },
      relations: { role: true },
    });

    if (!emp) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    const isMatch = await bcrypt.compare(dto.password, emp.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    const payload = {
      sub: emp.id,
      type: 'employee',
      role: emp.role?.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      employee: {
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        username: emp.username,
        role: emp.role?.name,
        mustChangePassword: emp.mustChangePassword,
        paidLeaveBalance: emp.paidLeaveBalance,
        rttBalance: emp.rttBalance,
      },
    };
  }

  async changePassword(employeeId: string, newPassword: string) {
    const emp = await this.employeeRepo.findOne({ where: { id: employeeId } });
    if (!emp) {
      throw new NotFoundException('Employé non trouvé');
    }

    emp.passwordHash = await bcrypt.hash(newPassword, 10);
    emp.mustChangePassword = false;
    await this.employeeRepo.save(emp);

    return { success: true, message: 'Mot de passe modifié avec succès' };
  }

  async loginUser(dto: LoginUserDto) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.twoFactorSecret')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.email = :email AND user.isActive = true', { email: dto.email })
      .getOne();

    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Identifiants invalides');

    // 2FA Mandatory Check for Backoffice Users
    if (!user.isTwoFactorEnabled) {
      if (!user.twoFactorSecret) {
        user.twoFactorSecret = TotpUtils.generateSecret();
        await this.userRepo.save(user);
      }
      const otpauthUrl = TotpUtils.generateOtpauthUrl(user.email, 'EDGS Platform', user.twoFactorSecret);

      if (!dto.twoFactorCode) {
        return {
          twoFactorSetupRequired: true,
          email: user.email,
          secret: user.twoFactorSecret,
          otpauthUrl,
          message: 'Obligatoire : Scannez le QR Code dans Google Authenticator et entrez le code à 6 chiffres',
        };
      }

      const isValid = TotpUtils.verifyTotp(dto.twoFactorCode, user.twoFactorSecret);
      if (!isValid) {
        throw new UnauthorizedException('Code 2FA invalide. Veuillez réessayer.');
      }

      user.isTwoFactorEnabled = true;
      await this.userRepo.save(user);
    } else {
      if (!dto.twoFactorCode) {
        return {
          twoFactorRequired: true,
          email: user.email,
          message: 'Veuillez saisir votre code Google Authenticator à 6 chiffres',
        };
      }

      const isValidTotp = TotpUtils.verifyTotp(dto.twoFactorCode, user.twoFactorSecret);
      if (!isValidTotp) {
        throw new UnauthorizedException('Code 2FA Google Authenticator invalide ou expiré');
      }
    }

    const payload = { sub: user.id, type: 'user', role: user.role?.name };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role?.name,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    };
  }

  async generate2faSecret(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const secret = TotpUtils.generateSecret();
    const otpauthUrl = TotpUtils.generateOtpauthUrl(user.email, 'EDGS Platform', secret);

    user.twoFactorSecret = secret;
    await this.userRepo.save(user);

    return {
      secret,
      otpauthUrl,
    };
  }

  async enable2fa(userId: string, code: string) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.twoFactorSecret')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('Veuillez d\'abord générer le QR Code 2FA');
    }

    const isValid = TotpUtils.verifyTotp(code, user.twoFactorSecret);
    if (!isValid) {
      throw new BadRequestException('Code de vérification invalide. Veuillez réessayer.');
    }

    user.isTwoFactorEnabled = true;
    await this.userRepo.save(user);

    return { success: true, message: 'Double authentification 2FA activée avec succès !' };
  }

  async disable2fa(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null as any;
    await this.userRepo.save(user);

    return { success: true, message: 'Double authentification 2FA désactivée' };
  }
}
