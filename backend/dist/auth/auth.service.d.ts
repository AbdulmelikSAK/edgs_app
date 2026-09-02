import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Employee } from '../database/entities/employee.entity';
import { User } from '../database/entities/user.entity';
import { LoginEmployeeDto } from './dto/login-employee.dto';
import { LoginUserDto } from './dto/login-user.dto';
export declare class AuthService {
    private employeeRepo;
    private userRepo;
    private jwtService;
    constructor(employeeRepo: Repository<Employee>, userRepo: Repository<User>, jwtService: JwtService);
    loginEmployee(dto: LoginEmployeeDto): Promise<{
        access_token: string;
        employee: {
            id: string;
            firstName: string;
            lastName: string;
            username: string;
            role: import("../database/entities/role.entity").RoleName;
            mustChangePassword: boolean;
            paidLeaveBalance: number;
            rttBalance: number | undefined;
        };
    }>;
    changePassword(employeeId: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    loginUser(dto: LoginUserDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("../database/entities/role.entity").RoleName;
        };
    }>;
}
