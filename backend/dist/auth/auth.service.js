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
const totp_utils_1 = require("./totp.utils");
let AuthService = class AuthService {
    employeeRepo;
    userRepo;
    jwtService;
    constructor(employeeRepo, userRepo, jwtService) {
        this.employeeRepo = employeeRepo;
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }
    async loginEmployee(dto) {
        const emp = await this.employeeRepo.findOne({
            where: { username: dto.username, isActive: true },
            relations: { role: true },
        });
        if (!emp) {
            throw new common_1.UnauthorizedException('Identifiants incorrects');
        }
        const isMatch = await bcrypt.compare(dto.password, emp.passwordHash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Identifiants incorrects');
        }
        const payload = {
            sub: emp.id,
            type: 'employee',
            role: emp.role?.name,
        };
        return {
            access_token: this.jwtService.sign(payload),
            employee: {
                id: emp.id,
                firstName: emp.firstName,
                lastName: emp.lastName,
                username: emp.username,
                role: emp.role?.name,
                mustChangePassword: emp.mustChangePassword,
                paidLeaveBalance: emp.paidLeaveBalance,
                rttBalance: emp.rttBalance,
            },
        };
    }
    async changePassword(employeeId, newPassword) {
        const emp = await this.employeeRepo.findOne({ where: { id: employeeId } });
        if (!emp) {
            throw new common_1.NotFoundException('Employé non trouvé');
        }
        emp.passwordHash = await bcrypt.hash(newPassword, 10);
        emp.mustChangePassword = false;
        await this.employeeRepo.save(emp);
        return { success: true, message: 'Mot de passe modifié avec succès' };
    }
    async loginUser(dto) {
        const user = await this.userRepo
            .createQueryBuilder('user')
            .addSelect('user.twoFactorSecret')
            .leftJoinAndSelect('user.role', 'role')
            .where('user.email = :email AND user.isActive = true', { email: dto.email })
            .getOne();
        if (!user)
            throw new common_1.UnauthorizedException('Identifiants invalides');
        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Identifiants invalides');
        if (!user.isTwoFactorEnabled) {
            if (!user.twoFactorSecret) {
                user.twoFactorSecret = totp_utils_1.TotpUtils.generateSecret();
                await this.userRepo.save(user);
            }
            const otpauthUrl = totp_utils_1.TotpUtils.generateOtpauthUrl(user.email, 'EDGS Platform', user.twoFactorSecret);
            if (!dto.twoFactorCode) {
                return {
                    twoFactorSetupRequired: true,
                    email: user.email,
                    secret: user.twoFactorSecret,
                    otpauthUrl,
                    message: 'Obligatoire : Scannez le QR Code dans Google Authenticator et entrez le code à 6 chiffres',
                };
            }
            const isValid = totp_utils_1.TotpUtils.verifyTotp(dto.twoFactorCode, user.twoFactorSecret);
            if (!isValid) {
                throw new common_1.UnauthorizedException('Code 2FA invalide. Veuillez réessayer.');
            }
            user.isTwoFactorEnabled = true;
            await this.userRepo.save(user);
        }
        else {
            if (!dto.twoFactorCode) {
                return {
                    twoFactorRequired: true,
                    email: user.email,
                    message: 'Veuillez saisir votre code Google Authenticator à 6 chiffres',
                };
            }
            const isValidTotp = totp_utils_1.TotpUtils.verifyTotp(dto.twoFactorCode, user.twoFactorSecret);
            if (!isValidTotp) {
                throw new common_1.UnauthorizedException('Code 2FA Google Authenticator invalide ou expiré');
            }
        }
        const payload = { sub: user.id, type: 'user', role: user.role?.name };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role?.name,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
            },
        };
    }
    async generate2faSecret(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        const secret = totp_utils_1.TotpUtils.generateSecret();
        const otpauthUrl = totp_utils_1.TotpUtils.generateOtpauthUrl(user.email, 'EDGS Platform', secret);
        user.twoFactorSecret = secret;
        await this.userRepo.save(user);
        return {
            secret,
            otpauthUrl,
        };
    }
    async enable2fa(userId, code) {
        const user = await this.userRepo
            .createQueryBuilder('user')
            .addSelect('user.twoFactorSecret')
            .where('user.id = :id', { id: userId })
            .getOne();
        if (!user || !user.twoFactorSecret) {
            throw new common_1.BadRequestException('Veuillez d\'abord générer le QR Code 2FA');
        }
        const isValid = totp_utils_1.TotpUtils.verifyTotp(code, user.twoFactorSecret);
        if (!isValid) {
            throw new common_1.BadRequestException('Code de vérification invalide. Veuillez réessayer.');
        }
        user.isTwoFactorEnabled = true;
        await this.userRepo.save(user);
        return { success: true, message: 'Double authentification 2FA activée avec succès !' };
    }
    async disable2fa(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        user.isTwoFactorEnabled = false;
        user.twoFactorSecret = null;
        await this.userRepo.save(user);
        return { success: true, message: 'Double authentification 2FA désactivée' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map