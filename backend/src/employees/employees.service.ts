import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee } from '../database/entities/employee.entity';
import { Role } from '../database/entities/role.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) {}

  private generateUsername(firstName: string, lastName: string): string {
    const firstLetterLast = lastName.trim().charAt(0);
    const raw = firstLetterLast + firstName.trim();
    return raw
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  async getUniqueUsername(firstName: string, lastName: string): Promise<string> {
    const base = this.generateUsername(firstName, lastName);
    let username = base;
    let counter = 1;
    while (await this.employeeRepo.findOne({ where: { username } })) {
      username = `${base}${counter}`;
      counter++;
    }
    return username;
  }

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const username = dto.username || (await this.getUniqueUsername(dto.firstName, dto.lastName));
    const rawPassword = dto.password || '123456';
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    const role = dto.roleId ? await this.roleRepo.findOne({ where: { id: dto.roleId } }) : null;
    
    const employee = this.employeeRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      username,
      passwordHash,
      mustChangePassword: true,
      badgeNumber: dto.badgeNumber,
      hourlyRate: dto.hourlyRate,
      monthlySalary: dto.monthlySalary,
      paidLeaveBalance: dto.paidLeaveBalance,
      rttBalance: dto.rttBalance,
      phone: dto.phone,
      email: dto.email,
      qualification: dto.qualification,
      documents: dto.documents,
      role: role ?? undefined,
    });
    return this.employeeRepo.save(employee);
  }

  findAll(): Promise<Employee[]> {
    return this.employeeRepo.find({ relations: { role: true }, where: { isActive: true } });
  }

  async findOne(id: string): Promise<Employee> {
    const emp = await this.employeeRepo.findOne({ where: { id }, relations: { role: true } });
    if (!emp) throw new NotFoundException(`Employe ${id} non trouve`);
    return emp;
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const emp = await this.findOne(id);
    
    // Hash password if updating
    if (dto.password) {
      emp.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    
    // Copy other fields
    const { password, ...fields } = dto;
    Object.assign(emp, fields);
    
    return this.employeeRepo.save(emp);
  }

  async remove(id: string): Promise<void> {
    const emp = await this.findOne(id);
    emp.isActive = false;
    await this.employeeRepo.save(emp);
  }
}
