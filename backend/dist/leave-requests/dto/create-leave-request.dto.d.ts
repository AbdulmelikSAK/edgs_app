import { LeaveType } from '../../database/entities/leave-request.entity';
export declare class CreateLeaveRequestDto {
    employeeId: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    isHalfDay?: boolean;
    reason?: string;
}
