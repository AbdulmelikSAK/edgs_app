import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee } from '../database/entities/employee.entity';
import { User } from '../database/entities/user.entity';
import { LoginEmployeeDto } from './dto/login-employee.dto';
import { LoginUserDto } from './dto/login-user.dto';

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
    const user = await this.userRepo.findOne({
      where: { email: dto.email, isActive: true },
      relations: { role: true },
    });

    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Identifiants invalides');

    const payload = { sub: user.id, type: 'user', role: user.role?.name };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role?.name,
      },
    };
  }
}
