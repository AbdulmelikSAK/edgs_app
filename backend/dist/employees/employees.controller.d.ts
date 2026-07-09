import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    create(dto: CreateEmployeeDto): Promise<import("../database/entities/employee.entity").Employee>;
    findAll(): Promise<import("../database/entities/employee.entity").Employee[]>;
    findOne(id: string): Promise<import("../database/entities/employee.entity").Employee>;
    update(id: string, dto: UpdateEmployeeDto): Promise<import("../database/entities/employee.entity").Employee>;
    remove(id: string): Promise<void>;
}
