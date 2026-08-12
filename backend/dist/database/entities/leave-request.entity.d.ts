import { Employee } from './employee.entity';
export declare enum LeaveType {
    CONGE = "conge",
    RTT = "rtt",
    SANS_SOLDE = "sans_solde",
    AUTRE = "autre"
}
export declare enum LeaveStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class LeaveRequest {
    id: string;
    employee: Employee;
    type: LeaveType;
    startDate: Date;
    endDate: Date;
    isHalfDay: boolean;
    status: LeaveStatus;
    reason: string;
    createdAt: Date;
    updatedAt: Date;
}
