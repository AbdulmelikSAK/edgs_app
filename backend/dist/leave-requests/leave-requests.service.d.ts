import { Repository } from 'typeorm';
import { LeaveRequest } from '../database/entities/leave-request.entity';
import { Employee } from '../database/entities/employee.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestStatusDto } from './dto/update-leave-request-status.dto';
export declare class LeaveRequestsService {
    private leaveRepo;
    private employeeRepo;
    constructor(leaveRepo: Repository<LeaveRequest>, employeeRepo: Repository<Employee>);
    private calculateDuration;
    create(dto: CreateLeaveRequestDto): Promise<LeaveRequest>;
    findAll(): Promise<LeaveRequest[]>;
    findByEmployee(employeeId: string): Promise<LeaveRequest[]>;
    updateStatus(id: string, dto: UpdateLeaveRequestStatusDto): Promise<LeaveRequest>;
    remove(id: string): Promise<void>;
}
