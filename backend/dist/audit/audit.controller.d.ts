import { Repository } from 'typeorm';
import { AuditLog } from '../database/entities/audit-log.entity';
export declare class AuditController {
    private readonly auditRepo;
    constructor(auditRepo: Repository<AuditLog>);
    findAll(): Promise<AuditLog[]>;
}
