import { Role } from './role.entity';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}
