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

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const pinHash = await bcrypt.hash(dto.pin, 10);
    const role = dto.roleId ? await this.roleRepo.findOne({ where: { id: dto.roleId } }) : null;
    const employee = this.employeeRepo.create({
      ...dto,
      pin: pinHash,
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
    if (dto.pin) (dto as any).pin = await bcrypt.hash(dto.pin, 10);
    Object.assign(emp, dto);
    return this.employeeRepo.save(emp);
  }

  async remove(id: string): Promise<void> {
    const emp = await this.findOne(id);
    emp.isActive = false;
    await this.employeeRepo.save(emp);
  }
}
