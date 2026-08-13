import { Role } from './role.entity';
export declare class Employee {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    passwordHash: string;
    mustChangePassword: boolean;
    badgeNumber: string | null;
    isActive: boolean;
    hourlyRate: number;
    monthlySalary: number;
    paidLeaveBalance: number;
    rttBalance: number;
    phone: string | null;
    email: string | null;
    qualification: string;
    documents: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}
