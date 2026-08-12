"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveRequestsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const leave_request_entity_1 = require("../database/entities/leave-request.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
let LeaveRequestsService = class LeaveRequestsService {
    leaveRepo;
    employeeRepo;
    constructor(leaveRepo, employeeRepo) {
        this.leaveRepo = leaveRepo;
        this.employeeRepo = employeeRepo;
    }
    calculateDuration(startDate, endDate, isHalfDay) {
        if (isHalfDay)
            return 0.5;
        let count = 0;
        const cur = new Date(startDate);
        const end = new Date(endDate);
        cur.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        while (cur <= end) {
            const day = cur.getDay();
            if (day !== 0 && day !== 6) {
                count++;
            }
            cur.setDate(cur.getDate() + 1);
        }
        return count;
    }
    async create(dto) {
        const employee = await this.employeeRepo.findOne({ where: { id: dto.employeeId } });
        if (!employee)
            throw new common_1.NotFoundException('Employé non trouvé');
        const start = new Date(dto.startDate);
        const end = new Date(dto.endDate);
        const isHalfDay = !!dto.isHalfDay;
        if (start > end) {
            throw new common_1.BadRequestException('La date de début doit être antérieure à la date de fin');
        }
        const duration = this.calculateDuration(start, end, isHalfDay);
        if (dto.type === leave_request_entity_1.LeaveType.CONGE) {
            if (Number(employee.paidLeaveBalance) < duration) {
                throw new common_1.BadRequestException(`Solde de congés payés insuffisant. Requis: ${duration}j, Disponible: ${employee.paidLeaveBalance}j`);
            }
        }
        else if (dto.type === leave_request_entity_1.LeaveType.RTT) {
            if (Number(employee.rttBalance) < duration) {
                throw new common_1.BadRequestException(`Solde de RTT insuffisant. Requis: ${duration}j, Disponible: ${employee.rttBalance}j`);
            }
        }
        const requiresValidation = dto.type === leave_request_entity_1.LeaveType.CONGE || dto.type === leave_request_entity_1.LeaveType.RTT;
        const status = requiresValidation ? leave_request_entity_1.LeaveStatus.PENDING : leave_request_entity_1.LeaveStatus.APPROVED;
        const request = this.leaveRepo.create({
            employee,
            type: dto.type,
            startDate: start,
            endDate: end,
            isHalfDay,
            status,
            reason: dto.reason,
        });
        const savedRequest = await this.leaveRepo.save(request);
        if (status === leave_request_entity_1.LeaveStatus.APPROVED) {
            if (dto.type === leave_request_entity_1.LeaveType.CONGE) {
                employee.paidLeaveBalance = Number(employee.paidLeaveBalance) - duration;
                await this.employeeRepo.save(employee);
            }
            else if (dto.type === leave_request_entity_1.LeaveType.RTT) {
                employee.rttBalance = Number(employee.rttBalance) - duration;
                await this.employeeRepo.save(employee);
            }
        }
        return savedRequest;
    }
    findAll() {
        return this.leaveRepo.find({
            relations: { employee: true },
            order: { createdAt: 'DESC' },
        });
    }
    findByEmployee(employeeId) {
        return this.leaveRepo.find({
            where: { employee: { id: employeeId } },
            relations: { employee: true },
            order: { createdAt: 'DESC' },
        });
    }
    async updateStatus(id, dto) {
        const request = await this.leaveRepo.findOne({
            where: { id },
            relations: { employee: true },
        });
        if (!request)
            throw new common_1.NotFoundException('Demande de congé non trouvée');
        if (request.status !== leave_request_entity_1.LeaveStatus.APPROVED && dto.status === leave_request_entity_1.LeaveStatus.APPROVED) {
            const duration = this.calculateDuration(request.startDate, request.endDate, request.isHalfDay);
            const employee = request.employee;
            if (request.type === leave_request_entity_1.LeaveType.CONGE) {
                if (Number(employee.paidLeaveBalance) < duration) {
                    throw new common_1.BadRequestException(`Solde insuffisant pour approuver cette demande. Requis: ${duration}j, Disponible: ${employee.paidLeaveBalance}j`);
                }
                employee.paidLeaveBalance = Number(employee.paidLeaveBalance) - duration;
                await this.employeeRepo.save(employee);
            }
            else if (request.type === leave_request_entity_1.LeaveType.RTT) {
                if (Number(employee.rttBalance) < duration) {
                    throw new common_1.BadRequestException(`Solde insuffisant pour approuver cette demande. Requis: ${duration}j, Disponible: ${employee.rttBalance}j`);
                }
                employee.rttBalance = Number(employee.rttBalance) - duration;
                await this.employeeRepo.save(employee);
            }
        }
        request.status = dto.status;
        return this.leaveRepo.save(request);
    }
    async remove(id) {
        await this.leaveRepo.delete(id);
    }
};
exports.LeaveRequestsService = LeaveRequestsService;
exports.LeaveRequestsService = LeaveRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(leave_request_entity_1.LeaveRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], LeaveRequestsService);
//# sourceMappingURL=leave-requests.service.js.map