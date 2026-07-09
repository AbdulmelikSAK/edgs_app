import { Role } from './role.entity';
export declare class Employee {
    id: string;
    firstName: string;
    lastName: string;
    pin: string;
    badgeNumber: string;
    isActive: boolean;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}
