import { User } from './user.entity';
export declare class AuditLog {
    id: string;
    user: User;
    action: string;
    entityType: string;
    entityId: string;
    oldValues: Record<string, any>;
    newValues: Record<string, any>;
    ipAddress: string;
    createdAt: Date;
}
