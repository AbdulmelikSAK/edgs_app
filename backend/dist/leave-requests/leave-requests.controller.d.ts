import { LeaveRequestsService } from './leave-requests.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestStatusDto } from './dto/update-leave-request-status.dto';
export declare class LeaveRequestsController {
    private readonly leaveService;
    constructor(leaveService: LeaveRequestsService);
    create(dto: CreateLeaveRequestDto): Promise<import("../database/entities/leave-request.entity").LeaveRequest>;
    findAll(): Promise<import("../database/entities/leave-request.entity").LeaveRequest[]>;
    findByEmployee(employeeId: string): Promise<import("../database/entities/leave-request.entity").LeaveRequest[]>;
    updateStatus(id: string, dto: UpdateLeaveRequestStatusDto): Promise<import("../database/entities/leave-request.entity").LeaveRequest>;
    remove(id: string): Promise<void>;
}
