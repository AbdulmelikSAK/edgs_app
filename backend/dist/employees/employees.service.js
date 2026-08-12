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
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const employee_entity_1 = require("../database/entities/employee.entity");
const role_entity_1 = require("../database/entities/role.entity");
let EmployeesService = class EmployeesService {
    employeeRepo;
    roleRepo;
    constructor(employeeRepo, roleRepo) {
        this.employeeRepo = employeeRepo;
        this.roleRepo = roleRepo;
    }
    generateUsername(firstName, lastName) {
        const firstLetterLast = lastName.trim().charAt(0);
        const raw = firstLetterLast + firstName.trim();
        return raw
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');
    }
    async getUniqueUsername(firstName, lastName) {
        const base = this.generateUsername(firstName, lastName);
        let username = base;
        let counter = 1;
        while (await this.employeeRepo.findOne({ where: { username } })) {
            username = `${base}${counter}`;
            counter++;
        }
        return username;
    }
    async create(dto) {
        const username = dto.username || (await this.getUniqueUsername(dto.firstName, dto.lastName));
        const rawPassword = dto.password || '123456';
        const passwordHash = await bcrypt.hash(rawPassword, 10);
        const role = dto.roleId ? await this.roleRepo.findOne({ where: { id: dto.roleId } }) : null;
        const employee = this.employeeRepo.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            username,
            passwordHash,
            mustChangePassword: true,
            badgeNumber: dto.badgeNumber,
            hourlyRate: dto.hourlyRate,
            monthlySalary: dto.monthlySalary,
            paidLeaveBalance: dto.paidLeaveBalance,
            rttBalance: dto.rttBalance,
            phone: dto.phone,
            email: dto.email,
            qualification: dto.qualification,
            documents: dto.documents,
            role: role ?? undefined,
        });
        return this.employeeRepo.save(employee);
    }
    findAll() {
        return this.employeeRepo.find({ relations: { role: true }, where: { isActive: true } });
    }
    async findOne(id) {
        const emp = await this.employeeRepo.findOne({ where: { id }, relations: { role: true } });
        if (!emp)
            throw new common_1.NotFoundException(`Employe ${id} non trouve`);
        return emp;
    }
    async update(id, dto) {
        const emp = await this.findOne(id);
        if (dto.password) {
            emp.passwordHash = await bcrypt.hash(dto.password, 10);
        }
        const { password, ...fields } = dto;
        Object.assign(emp, fields);
        return this.employeeRepo.save(emp);
    }
    async remove(id) {
        const emp = await this.findOne(id);
        emp.isActive = false;
        await this.employeeRepo.save(emp);
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map