"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const employee_entity_1 = require("../database/entities/employee.entity");
const user_entity_1 = require("../database/entities/user.entity");
const truck_entity_1 = require("../database/entities/truck.entity");
let AuthService = class AuthService {
    employeeRepo;
    userRepo;
    truckRepo;
    jwtService;
    constructor(employeeRepo, userRepo, truckRepo, jwtService) {
        this.employeeRepo = employeeRepo;
        this.userRepo = userRepo;
        this.truckRepo = truckRepo;
        this.jwtService = jwtService;
    }
    async loginWithPin(dto) {
        const matchedTruck = await this.truckRepo.findOne({
            where: { pinCode: dto.pin, isActive: true },
            relations: { stocks: { stockItem: true } }
        });
        if (matchedTruck) {
            const defaultEmp = await this.employeeRepo.findOne({ where: { isActive: true } });
            const payload = {
                sub: defaultEmp?.id || matchedTruck.id,
                type: 'employee',
                role: 'driver',
            };
            return {
                access_token: this.jwtService.sign(payload),
                employee: {
                    id: defaultEmp?.id || 'default-employee-id',
                    firstName: 'Chauffeur',
                    lastName: matchedTruck.plateNumber,
                    role: 'driver',
                },
                truck: {
                    id: matchedTruck.id,
                    plateNumber: matchedTruck.plateNumber,
                    model: matchedTruck.model,
                    year: matchedTruck.year,
                    currentStock: matchedTruck.currentStock,
                    stockAlertThreshold: matchedTruck.stockAlertThreshold,
                    stocks: matchedTruck.stocks
                }
            };
        }
        const employees = await this.employeeRepo.find({
            where: { isActive: true },
            relations: { role: true },
        });
        let matchedEmployee = null;
        for (const emp of employees) {
            const isMatch = await bcrypt.compare(dto.pin, emp.pin);
            if (isMatch) {
                matchedEmployee = emp;
                break;
            }
        }
        if (!matchedEmployee) {
            throw new common_1.UnauthorizedException('PIN incorrect');
        }
        const payload = {
            sub: matchedEmployee.id,
            type: 'employee',
            role: matchedEmployee.role?.name,
        };
        return {
            access_token: this.jwtService.sign(payload),
            employee: {
                id: matchedEmployee.id,
                firstName: matchedEmployee.firstName,
                lastName: matchedEmployee.lastName,
                role: matchedEmployee.role?.name,
            },
        };
    }
    async loginUser(dto) {
        const user = await this.userRepo.findOne({
            where: { email: dto.email, isActive: true },
            relations: { role: true },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Identifiants invalides');
        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Identifiants invalides');
        const payload = { sub: user.id, type: 'user', role: user.role?.name };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role?.name,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(truck_entity_1.Truck)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map