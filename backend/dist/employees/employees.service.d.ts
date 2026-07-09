import { Repository } from 'typeorm';
import { Employee } from '../database/entities/employee.entity';
import { Role } from '../database/entities/role.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
export declare class EmployeesService {
    private employeeRepo;
    private roleRepo;
    constructor(employeeRepo: Repository<Employee>, roleRepo: Repository<Role>);
    create(dto: CreateEmployeeDto): Promise<Employee>;
    findAll(): Promise<Employee[]>;
    findOne(id: string): Promise<Employee>;
    update(id: string, dto: UpdateEmployeeDto): Promise<Employee>;
    remove(id: string): Promise<void>;
}
