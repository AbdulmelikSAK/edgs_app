import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Employee } from '../database/entities/employee.entity';
import { User } from '../database/entities/user.entity';
import { LoginPinDto } from './dto/login-pin.dto';
import { LoginUserDto } from './dto/login-user.dto';
export declare class AuthService {
    private employeeRepo;
    private userRepo;
    private jwtService;
    constructor(employeeRepo: Repository<Employee>, userRepo: Repository<User>, jwtService: JwtService);
    loginWithPin(dto: LoginPinDto): Promise<{
        access_token: string;
        employee: {
            id: string;
            firstName: string;
            lastName: string;
            role: import("../database/entities/role.entity").RoleName;
        };
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
