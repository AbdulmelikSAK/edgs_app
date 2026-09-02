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
        twoFactorSetupRequired: boolean;
        email: string;
        secret: string;
        otpauthUrl: string;
        message: string;
        twoFactorRequired?: undefined;
        access_token?: undefined;
        user?: undefined;
    } | {
        twoFactorRequired: boolean;
        email: string;
        message: string;
        twoFactorSetupRequired?: undefined;
        secret?: undefined;
        otpauthUrl?: undefined;
        access_token?: undefined;
        user?: undefined;
    } | {
        access_token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("../database/entities/role.entity").RoleName;
            isTwoFactorEnabled: true;
        };
        twoFactorSetupRequired?: undefined;
        email?: undefined;
        secret?: undefined;
        otpauthUrl?: undefined;
        message?: undefined;
        twoFactorRequired?: undefined;
    }>;
    generate2faSecret(userId: string): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    enable2fa(userId: string, code: string): Promise<{
        success: boolean;
        message: string;
    }>;
    disable2fa(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
