import { Role } from './role.entity';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    twoFactorSecret: string;
    isTwoFactorEnabled: boolean;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}
