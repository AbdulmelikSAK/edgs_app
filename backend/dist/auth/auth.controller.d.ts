import { AuthService } from './auth.service';
import { LoginPinDto } from './dto/login-pin.dto';
import { LoginUserDto } from './dto/login-user.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
