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
            role: string;
        };
        truck: {
            id: string;
            plateNumber: string;
            model: string;
            year: number;
            currentStock: number;
            stockAlertThreshold: number;
            stocks: import("../database/entities/truck-stock.entity").TruckStock[];
        };
    } | {
        access_token: string;
        employee: {
            id: string;
            firstName: string;
            lastName: string;
            role: import("../database/entities/role.entity").RoleName;
        };
        truck?: undefined;
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
