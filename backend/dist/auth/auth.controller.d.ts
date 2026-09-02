import { AuthService } from './auth.service';
import { LoginEmployeeDto } from './dto/login-employee.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
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
    generate2faSecret(req: any): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    enable2fa(req: any, code: string): Promise<{
        success: boolean;
        message: string;
    }>;
    disable2fa(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
