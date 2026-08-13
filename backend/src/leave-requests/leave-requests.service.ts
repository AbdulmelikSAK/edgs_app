import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LeaveRequest,
  LeaveType,
  LeaveStatus,
} from '../database/entities/leave-request.entity';
import { Employee } from '../database/entities/employee.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestStatusDto } from './dto/update-leave-request-status.dto';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRepo: Repository<LeaveRequest>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
  ) {}

  private calculateDuration(
    startDate: Date,
    endDate: Date,
    isHalfDay: boolean,
  ): number {
    if (isHalfDay) return 0.5;

    let count = 0;
    const cur = new Date(startDate);
    const end = new Date(endDate);

    cur.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    while (cur <= end) {
      const day = cur.getDay(); // 0 = Sunday, 6 = Saturday
      if (day !== 0 && day !== 6) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }

  async create(dto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const employee = await this.employeeRepo.findOne({
      where: { id: dto.employeeId },
    });
    if (!employee) throw new NotFoundException('Employé non trouvé');

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const isHalfDay = !!dto.isHalfDay;

    if (start > end) {
      throw new BadRequestException(
        'La date de début doit être antérieure à la date de fin',
      );
    }

    const duration = this.calculateDuration(start, end, isHalfDay);

    // If it's conge or rtt, verify balance
    if (dto.type === LeaveType.CONGE) {
      if (Number(employee.paidLeaveBalance) < duration) {
        throw new BadRequestException(
          `Solde de congés payés insuffisant. Requis: ${duration}j, Disponible: ${employee.paidLeaveBalance}j`,
        );
      }
    } else if (dto.type === LeaveType.RTT) {
      if (Number(employee.rttBalance) < duration) {
        throw new BadRequestException(
          `Solde de RTT insuffisant. Requis: ${duration}j, Disponible: ${employee.rttBalance}j`,
        );
      }
    }

    // Auto-approve absences (sans_solde, autre)
    const requiresValidation =
      dto.type === LeaveType.CONGE || dto.type === LeaveType.RTT;
    const status = requiresValidation
      ? LeaveStatus.PENDING
      : LeaveStatus.APPROVED;

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

    // If auto-approved conge/rtt (unlikely based on type, but for safety), deduct balance
    if (status === LeaveStatus.APPROVED) {
      if (dto.type === LeaveType.CONGE) {
        employee.paidLeaveBalance =
          Number(employee.paidLeaveBalance) - duration;
        await this.employeeRepo.save(employee);
      } else if (dto.type === LeaveType.RTT) {
        employee.rttBalance = Number(employee.rttBalance) - duration;
        await this.employeeRepo.save(employee);
      }
    }

    return savedRequest;
  }

  findAll(): Promise<LeaveRequest[]> {
    return this.leaveRepo.find({
      relations: { employee: true },
      order: { createdAt: 'DESC' },
    });
  }

  findByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    return this.leaveRepo.find({
      where: { employee: { id: employeeId } },
      relations: { employee: true },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateLeaveRequestStatusDto,
  ): Promise<LeaveRequest> {
    const request = await this.leaveRepo.findOne({
      where: { id },
      relations: { employee: true },
    });
    if (!request) throw new NotFoundException('Demande de congé non trouvée');

    // Deduct balance if transitioning to APPROVED
    if (
      request.status !== LeaveStatus.APPROVED &&
      dto.status === LeaveStatus.APPROVED
    ) {
      const duration = this.calculateDuration(
        request.startDate,
        request.endDate,
        request.isHalfDay,
      );
      const employee = request.employee;

      if (request.type === LeaveType.CONGE) {
        if (Number(employee.paidLeaveBalance) < duration) {
          throw new BadRequestException(
            `Solde insuffisant pour approuver cette demande. Requis: ${duration}j, Disponible: ${employee.paidLeaveBalance}j`,
          );
        }
        employee.paidLeaveBalance =
          Number(employee.paidLeaveBalance) - duration;
        await this.employeeRepo.save(employee);
      } else if (request.type === LeaveType.RTT) {
        if (Number(employee.rttBalance) < duration) {
          throw new BadRequestException(
            `Solde insuffisant pour approuver cette demande. Requis: ${duration}j, Disponible: ${employee.rttBalance}j`,
          );
        }
        employee.rttBalance = Number(employee.rttBalance) - duration;
        await this.employeeRepo.save(employee);
      }
    }

    request.status = dto.status;
    return this.leaveRepo.save(request);
  }

  async remove(id: string): Promise<void> {
    await this.leaveRepo.delete(id);
  }
}
