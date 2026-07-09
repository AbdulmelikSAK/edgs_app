import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee } from '../database/entities/employee.entity';
import { User } from '../database/entities/user.entity';
import { Truck } from '../database/entities/truck.entity';
import { LoginPinDto } from './dto/login-pin.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Truck)
    private truckRepo: Repository<Truck>,
    private jwtService: JwtService,
  ) {}

  async loginWithPin(dto: LoginPinDto) {
    // 1. Check if PIN matches a Truck directly (e.g. "1212")
    const matchedTruck = await this.truckRepo.findOne({
      where: { pinCode: dto.pin, isActive: true },
      relations: { stocks: { stockItem: true } }
    });

    if (matchedTruck) {
      // Find the first active employee to satisfy database constraint dependencies (badge tracking)
      const defaultEmp = await this.employeeRepo.findOne({ where: { isActive: true } });
      const payload = {
        sub: defaultEmp?.id || matchedTruck.id,
        type: 'employee',
        role: 'driver',
      };
      return {
        access_token: this.jwtService.sign(payload),
        employee: {
          id: defaultEmp?.id || 'default-employee-id',
          firstName: 'Chauffeur',
          lastName: matchedTruck.plateNumber,
          role: 'driver',
        },
        truck: {
          id: matchedTruck.id,
          plateNumber: matchedTruck.plateNumber,
          model: matchedTruck.model,
          year: matchedTruck.year,
          currentStock: matchedTruck.currentStock,
          stockAlertThreshold: matchedTruck.stockAlertThreshold,
          stocks: matchedTruck.stocks
        }
      };
    }

    // 2. Otherwise, check employee PINs (compatibility mode)
    const employees = await this.employeeRepo.find({
      where: { isActive: true },
      relations: { role: true },
    });

    let matchedEmployee: Employee | null = null;
    for (const emp of employees) {
      const isMatch = await bcrypt.compare(dto.pin, emp.pin);
      if (isMatch) {
        matchedEmployee = emp;
        break;
      }
    }

    if (!matchedEmployee) {
      throw new UnauthorizedException('PIN incorrect');
    }

    const payload = {
      sub: matchedEmployee.id,
      type: 'employee',
      role: matchedEmployee.role?.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      employee: {
        id: matchedEmployee.id,
        firstName: matchedEmployee.firstName,
        lastName: matchedEmployee.lastName,
        role: matchedEmployee.role?.name,
      },
    };
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
